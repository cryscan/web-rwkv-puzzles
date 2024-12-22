use std::collections::HashMap;

use itertools::Itertools;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use web_rwkv::runtime::model::{ModelInfo, ModelVersion};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StateHeadStats {
    layer: usize,
    head: usize,
    bins: [f32; 5],
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateStats(Vec<StateHeadStats>);

#[wasm_bindgen]
impl StateStats {
    #[wasm_bindgen(constructor)]
    pub fn new(info: &ModelInfo, state: &[f32]) -> Result<Self, JsError> {
        let mut stats: HashMap<(usize, usize), Vec<f32>> = HashMap::new();
        let head_size = info.num_emb / info.num_head;

        for (index, &value) in state.iter().enumerate() {
            match info.version {
                ModelVersion::V4 => break,
                ModelVersion::V5 | ModelVersion::V6 | ModelVersion::V7 => {
                    let column = index % info.num_emb;
                    let line = index / info.num_emb;

                    let head = column / head_size;
                    let layer = line / (head_size + 2);

                    let y = line % (head_size + 2);
                    if y == 0 || y == head_size + 1 {
                        continue;
                    }

                    let key = (layer, head);
                    match stats.get_mut(&key) {
                        Some(values) => values.push(value),
                        None => {
                            stats.insert(key, vec![value]);
                        }
                    }
                }
            }
        }

        let state_data = StateStats(
            stats
                .into_iter()
                .map(|((layer, head), values)| {
                    let mut values = values.clone();
                    values.sort_by(|x, y| x.total_cmp(y));
                    let p0 = 0usize;
                    let p4 = values.len() - 1;
                    let p2 = (p0 + p4) / 2;
                    let p1 = (p0 + p2) / 2;
                    let p3 = (p2 + p4) / 2;

                    let min = values[p0];
                    let max = values[p4];
                    let q1 = (values[p1] + values[p1 + 1]) / 2.0;
                    let q2 = (values[p2] + values[p2 + 1]) / 2.0;
                    let q3 = (values[p3] + values[p3 + 1]) / 2.0;
                    let bins = [min, q1, q2, q3, max];
                    StateHeadStats { layer, head, bins }
                })
                .sorted_by_key(|x| (x.layer, x.head))
                .collect(),
        );
        Ok(state_data)
    }

    pub fn to_json(&self) -> Result<String, JsError> {
        serde_json::to_string(self).map_err(err)
    }
}

fn err(err: impl ToString) -> JsError {
    JsError::new(&err.to_string())
}
