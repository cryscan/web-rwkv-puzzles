use std::{
    cell::{Cell, RefCell},
    collections::HashMap,
};

use anyhow::Result;
use half::f16;
use wasm_bindgen::prelude::*;
use web_rwkv::{
    context::{Context, ContextBuilder, InstanceExt},
    num::Float,
    runtime::{
        infer::{InferInput, InferInputBatch, InferOption},
        loader::{Loader, Reader},
        model::{Bundle, ContextAutoLimits, ModelBuilder, ModelInfo, ModelVersion, State, Quant},
        softmax::softmax_one,
        v4, v5, v6, v7, Runtime, SimpleRuntime,
    },
    tensor::{TensorCpu, ops::TensorOp},
    wgpu::{Instance, PowerPreference},
};

use crate::{loader::TensorReader, ops::TensorOpExt};

pub const TOKEN_CHUNK_SIZE: usize = 128;

#[wasm_bindgen]
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash)]
pub struct StateId(uid::Id<StateId>);

#[wasm_bindgen]
impl StateId {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self(uid::Id::new())
    }
}

/// We need to slightly modify the model structure using hooks.
fn make_hooks<F: Float>(info: &ModelInfo) -> Result<v6::HookMap<F>> {
    let mut hooks = v6::HookMap::new();
    for layer in 0..info.num_layer {
        // add a custom operation before time-mix for each layer
        hooks.insert(
            v6::Hook::PreAttTimeDecayActivate(layer),
            Box::new(move |frame: v6::Frame<F>| {
                let op = TensorOp::mul_exp(&frame.buffer.time_decay, &frame.buffer.att_k)?;
                Ok(TensorOp::List(vec![op]))
            }),
        );
    }
    Ok(hooks)
}

pub struct Session {
    context: Context,
    info: ModelInfo,
    runtime: Box<dyn Runtime>,
    state: Box<dyn State>,
    current: Cell<StateId>,
    backed: RefCell<HashMap<StateId, TensorCpu<f32>>>,
}

impl Session {
    pub async fn new<R: Reader>(model: R, quant: usize, quant_nf4: usize, is_puzzle_model: bool) -> Result<Self> {
        let instance = Instance::new(Default::default());
        let adapter = instance
            .adapter(PowerPreference::HighPerformance)
            .await
            .expect("failed to request adapter");
        let info = Loader::info(&model)?;

        let context = ContextBuilder::new(adapter)
            .auto_limits(&info)
            .build()
            .await?;

        let quant = (0..quant)
            .map(|layer| (layer, Quant::Int8))
            .chain((0..quant_nf4).map(|layer| (layer, Quant::NF4)))
            .collect();
        let builder = ModelBuilder::new(&context, model).quant(quant);
        let (runtime, state): (Box<dyn Runtime>, Box<dyn State>) = match is_puzzle_model {
            true => {
                let hooks = make_hooks(&info)?;
                let model = builder.build_v6().await?;
                let bundle = v6::Bundle::<f16>::new_with_hooks(model, 1, hooks);
                let state = bundle.state();
                let runtime = SimpleRuntime::new(bundle);
                (Box::new(runtime), Box::new(state))
            }
            false => match info.version {
                ModelVersion::V4 => {
                    let model = builder.build_v4().await?;
                    let bundle = v4::Bundle::<f16>::new(model, 1);
                    let state = bundle.state();
                    let runtime = SimpleRuntime::new(bundle);
                    (Box::new(runtime), Box::new(state))
                }
                ModelVersion::V5 => {
                    let model = builder.build_v5().await?;
                    let bundle = v5::Bundle::<f16>::new(model, 1);
                    let state = bundle.state();
                    let runtime = SimpleRuntime::new(bundle);
                    (Box::new(runtime), Box::new(state))
                }
                ModelVersion::V6 => {
                    let model = builder.build_v6().await?;
                    let bundle = v6::Bundle::<f16>::new(model, 1);
                    let state = bundle.state();
                    let runtime = SimpleRuntime::new(bundle);
                    (Box::new(runtime), Box::new(state))
                }
                ModelVersion::V7 => {
                    let model = builder.build_v7().await?;
                    let bundle = v7::Bundle::<f16>::new(model, 1);
                    let state = bundle.state();
                    let runtime = SimpleRuntime::new(bundle);
                    (Box::new(runtime), Box::new(state))
                }
            }
        };

        Ok(Self {
            context,
            info,
            runtime,
            state,
            current: Cell::new(StateId::new()),
            backed: RefCell::new(HashMap::new()),
        })
    }

    async fn back(&self) -> Result<()> {
        let id = self.current.get();
        let backed = self.state.back(0).await?;
        self.backed.borrow_mut().insert(id, backed);
        Ok(())
    }

    async fn checkout(&self, id: StateId) -> Result<()> {
        if self.current.get() == id {
            return Ok(());
        }

        self.back().await?;
        self.current.set(id);

        let backed = self.backed.borrow();
        match backed.get(&id) {
            Some(backed) => self.state.load(backed.clone(), 0)?,
            None => self.state.load(self.state.init(), 0)?,
        }

        Ok(())
    }

    pub async fn run(&self, tokens: &[u16], state: &StateId) -> Result<Vec<f32>> {
        self.checkout(*state).await?;

        let tokens = tokens.to_owned();
        let mut inference = Some(InferInput::new(
            vec![InferInputBatch {
                tokens,
                option: InferOption::Last,
            }],
            TOKEN_CHUNK_SIZE,
        ));

        let output = loop {
            let input = inference.take().unwrap();
            let (input, output) = self.runtime.infer(input).await?;
            inference = Some(input);

            let output = output[0].0.clone();
            if !output.is_empty() {
                let output = softmax_one(&self.context, output).await?;
                break output.to_vec();
            }
        };
        Ok(output)
    }
}

fn err(err: impl ToString) -> JsError {
    JsError::new(&err.to_string())
}

#[wasm_bindgen(js_name = Session)]
pub struct SessionExport(Session);

#[wasm_bindgen(js_class = Session)]
impl SessionExport {
    #[wasm_bindgen(constructor)]
    pub async fn new(model: TensorReader, quant: usize, quant_nf4: usize, is_puzzle_model: bool) -> Result<Self, JsError> {
        let session = Session::new(model, quant, quant_nf4, is_puzzle_model).await.map_err(err)?;
        Ok(Self(session))
    }

    pub async fn run(
        &self,
        tokens: &[u16],
        output: &mut [f32],
        state: &StateId,
    ) -> Result<(), JsError> {
        let data = self.0.run(tokens, state).await.map_err(err)?;
        // assert_eq!(data.len(), output.len());
        output.copy_from_slice(&data[..output.len()]);
        Ok(())
    }

    pub fn info(&self) -> ModelInfo {
        self.0.info.clone()
    }
}
