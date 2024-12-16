#!/bin/bash

# Build wasm
echo "==== building wasm ===="
RUSTFLAGS=--cfg=web_sys_unstable_apis wasm-pack build --release --target no-modules

echo "==== copy pkg files ===="
cp pkg/web_rwkv_puzzles.js web/
cp pkg/web_rwkv_puzzles.d.ts web/
cp pkg/web_rwkv_puzzles_bg.wasm web/
cp pkg/web_rwkv_puzzles_bg.wasm.d.ts web/

# Build typescript
echo "==== building typescript ===="
npx tsc

echo "==== copy js files ===="
cp web/web_rwkv_puzzles_bg.wasm frontend/public/llm
cp web/web_rwkv_puzzles.js frontend/public/llm
cp web/app.js frontend/public/llm
cp web/common.js frontend/public/llm
cp web/worker.js frontend/public/llm

echo "==== build react ===="
CI=false npm --prefix frontend run build