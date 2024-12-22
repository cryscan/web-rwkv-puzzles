use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use web_rwkv::runtime::model::{ModelInfo, ModelVersion};

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
struct StateItem {
    layer: u8,
    head: u8,
    x: u8,
    y: u8,
    value: f32,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateData(Vec<StateItem>);

#[wasm_bindgen]
impl StateData {
    #[wasm_bindgen(constructor)]
    pub fn new(info: &ModelInfo, state: &[f32]) -> Result<Self, JsError> {
        let mut state_data = StateData(vec![]);

        for (index, &value) in state.iter().enumerate() {
            match info.version {
                ModelVersion::V4 => break,
                ModelVersion::V5 | ModelVersion::V6 | ModelVersion::V7 => {
                    let head_size = info.num_emb / info.num_head;
                    let column = index % info.num_emb;
                    let line = index / info.num_emb;

                    let head = column / head_size;
                    let layer = line / (head_size + 2);

                    let x = column % head_size;
                    let y = line % (head_size + 2);

                    if y == 0 || y == head_size + 1 {
                        continue;
                    }

                    state_data.0.push(StateItem {
                        layer: layer as u8,
                        head: head as u8,
                        x: x as u8,
                        y: y as u8,
                        value,
                    });
                }
            }
        }

        Ok(state_data)
    }

    pub fn to_json(&self) -> Result<String, JsError> {
        serde_json::to_string(self).map_err(err)
    }
}

fn err(err: impl ToString) -> JsError {
    JsError::new(&err.to_string())
}
