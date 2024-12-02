@echo ==== build wasm ====
@set RUSTFLAGS=--cfg=web_sys_unstable_apis
@wasm-pack build --release --target no-modules

@echo ==== copy pkg files ====
@copy pkg\web_rwkv_puzzles.js web\
@copy pkg\web_rwkv_puzzles.d.ts web\
@copy pkg\web_rwkv_puzzles_bg.wasm web\
@copy pkg\web_rwkv_puzzles_bg.wasm.d.ts web\
@copy pkg\web_rwkv_puzzles_bg.bin web\

@echo ==== build typescript ====
@npx tsc