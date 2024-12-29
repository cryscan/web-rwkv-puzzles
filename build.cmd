@echo ==== build wasm ====
@wasm-pack build --release --target no-modules

@echo ==== copy pkg files ====
@copy pkg\web_rwkv_puzzles.js web\
@copy pkg\web_rwkv_puzzles.d.ts web\
@copy pkg\web_rwkv_puzzles_bg.wasm web\
@copy pkg\web_rwkv_puzzles_bg.wasm.d.ts web\

@echo ==== build typescript ====
@call npx tsc

@echo ==== copy js files ====
@copy web\web_rwkv_puzzles_bg.wasm frontend\public\llm
@copy web\web_rwkv_puzzles.js frontend\public\llm
@copy web\worker.js frontend\public\llm

@echo ==== build react ====
npm --prefix frontend run build
