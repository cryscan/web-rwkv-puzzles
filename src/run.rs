use anyhow::Result;
use half::f16;
use wasm_bindgen::prelude::*;
use web_rwkv::{
    context::{Context, ContextBuilder, InstanceExt},
    num::Float,
    runtime::{
        infer::{InferInput, InferInputBatch, InferOption},
        loader::{Loader, Reader},
        model::{Bundle, ContextAutoLimits, ModelBuilder, ModelInfo, ModelVersion, Quant, State},
        softmax::softmax_one,
        v4, v5, v6, v7, Runtime, SimpleRuntime,
    },
    tensor::{ops::TensorOp, TensorCpu},
    wgpu::{Instance, PowerPreference},
};

use crate::{loader::TensorReader, ops::TensorOpExt};

pub const TOKEN_CHUNK_SIZE: usize = 128;

#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
pub enum SessionType {
    Puzzle,
    Chat,
    Music,
}

/// We need to slightly modify the model structure using hooks.
fn make_puzzle_hooks<F: Float>(info: &ModelInfo) -> Result<v6::HookMap<F>> {
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
    ty: SessionType,
}

impl Session {
    pub async fn new<R: Reader>(
        model: R,
        quant: usize,
        quant_nf4: usize,
        ty: SessionType,
    ) -> Result<Self> {
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
        let rescale_layer = match ty {
            SessionType::Chat => 6,
            SessionType::Puzzle | SessionType::Music => 999, // = no rescale
        };
        let (runtime, state): (Box<dyn Runtime>, Box<dyn State>) = match ty {
            SessionType::Puzzle => {
                let hooks = make_puzzle_hooks(&info)?;
                let model = builder.rescale(rescale_layer).build_v6().await?;
                let bundle = v6::Bundle::<f16>::new_with_hooks(model, 1, hooks);
                let state = bundle.state();
                let runtime = SimpleRuntime::new(bundle);
                (Box::new(runtime), Box::new(state))
            }
            SessionType::Chat | SessionType::Music => match info.version {
                ModelVersion::V4 => {
                    let model = builder.rescale(rescale_layer).build_v4().await?;
                    let bundle = v4::Bundle::<f16>::new(model, 1);
                    let state = bundle.state();
                    let runtime = SimpleRuntime::new(bundle);
                    (Box::new(runtime), Box::new(state))
                }
                ModelVersion::V5 => {
                    let model = builder.rescale(rescale_layer).build_v5().await?;
                    let bundle = v5::Bundle::<f16>::new(model, 1);
                    let state = bundle.state();
                    let runtime = SimpleRuntime::new(bundle);
                    (Box::new(runtime), Box::new(state))
                }
                ModelVersion::V6 => {
                    let model = builder.rescale(rescale_layer).build_v6().await?;
                    let bundle = v6::Bundle::<f16>::new(model, 1);
                    let state = bundle.state();
                    let runtime = SimpleRuntime::new(bundle);
                    (Box::new(runtime), Box::new(state))
                }
                ModelVersion::V7 => {
                    // no rescale needed for v7 models
                    let model = builder.build_v7().await?;
                    let bundle = v7::Bundle::<f16>::new(model, 1);
                    let state = bundle.state();
                    let runtime = SimpleRuntime::new(bundle);
                    (Box::new(runtime), Box::new(state))
                }
            },
        };

        Ok(Self {
            context,
            info,
            runtime,
            state,
            ty,
        })
    }

    pub async fn back(&self) -> Result<TensorCpu<f32>> {
        Ok(self.state.back(0).await?)
    }

    pub fn load(&self, backed: TensorCpu<f32>) -> Result<()> {
        Ok(self.state.load(backed, 0)?)
    }

    pub async fn run(&self, tokens: &[u16]) -> Result<TensorCpu<f32>> {
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
                break output;
            }
        };

        Ok(output)
    }

    pub async fn softmax(&self, logits: TensorCpu<f32>) -> Result<TensorCpu<f32>> {
        Ok(softmax_one(&self.context, logits).await?)
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
    pub async fn new(
        model: TensorReader,
        quant: usize,
        quant_nf4: usize,
        ty: SessionType,
    ) -> Result<Self, JsError> {
        let session = Session::new(model, quant, quant_nf4, ty)
            .await
            .map_err(err)?;
        Ok(Self(session))
    }

    pub async fn run(&self, tokens: &[u16], output: &mut [f32]) -> Result<(), JsError> {
        let data = self.0.run(tokens).await.map_err(err)?.to_vec();
        output.copy_from_slice(&data[..output.len()]);
        Ok(())
    }

    pub async fn softmax(&self, input: &[f32], output: &mut [f32]) -> Result<(), JsError> {
        assert_eq!(input.len(), output.len());
        let input = self
            .0
            .context
            .tensor_from_data([input.len(), 1, 1, 1], input.to_vec())
            .map_err(err)?;
        let data = self.0.softmax(input).await.map_err(err)?.to_vec();
        output.copy_from_slice(&data[..output.len()]);
        Ok(())
    }

    pub fn info(&self) -> ModelInfo {
        self.0.info.clone()
    }

    pub fn session_type(&self) -> SessionType {
        self.0.ty
    }

    pub fn state_len(&self) -> usize {
        self.0.state.init_shape().len()
    }

    pub async fn back(&self, backed: &mut [f32]) -> Result<(), JsError> {
        let data = self.0.back().await.map_err(err)?.to_vec();
        assert_eq!(data.len(), backed.len());
        backed.copy_from_slice(&data);
        Ok(())
    }

    pub fn load(&self, backed: &[f32]) -> Result<(), JsError> {
        let shape = self.0.state.init_shape();
        let backed = self.0.context.tensor_from_data(shape, backed.to_vec())?;
        self.0.load(backed).map_err(err)
    }
}
