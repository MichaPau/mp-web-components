import esbuild from 'esbuild';
import { rm } from 'node:fs/promises';

const outdir = './lib/dist';

await rm(outdir, {
    recursive: true,
    force: true,
})

let options = {
  entryPoints: ['./src/lit/**/*.ts', './src/native/**/*.ts'],
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: outdir,
  color: true,
  sourcemap: false,
  mainFields: ['module'],
  external: ['./src/utils/*', './src/helper/*', 'lit'],
  metafile: false,
  chunkNames: 'chunks/[name]-[hash]',
  logLevel: "debug",
  plugins: []
}

console.log("start lib build (esbuild)");
let result = await esbuild.build(options);
console.log("end dev build (esbuild)");
