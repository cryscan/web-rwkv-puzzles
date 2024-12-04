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
