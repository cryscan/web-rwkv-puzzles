# Web-RWKV Puzzles

Run the RWKV model locally in browser on your GPU to solve a 15 puzzle.
This demo is built upon the [web-rwkv](https://github.com/cryscan/web-rwkv) inference engine.

Check the [live demo](https://cryscan.github.io/web-rwkv-puzzles/)!

## Dependencies

### `node.js`, `pnpm` and `typescript`

Install requirements:

```bash
$ npm install --global pnpm
$ npm install --global typescript
$ pnpm install
```

### `rust` and `wasm-pack`

To install `wasm-pack`, use

```bash
$ cargo install wasm-pack
```

## Compile and Pack

To build and pack, run

```bash
$ ./build.cmd
```

### MacOS

First, make the script executable:

```bash
$ chmod +x build.bash
```

Then, run the script:

```bash
$ ./build.bash
```

## Run

```bash
$ cd frontend
$ pnpm start
```
