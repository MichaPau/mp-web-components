import esbuild from 'esbuild';
import { rm } from 'node:fs/promises';
import { $ } from "bun";

const outdir = './lib/dist';

await rm(outdir, {
    recursive: true,
    force: true,
})

let options = {
  entryPoints: ['./src/lit/**/*.ts', './src/native/**/*.ts'],
  bundle: false,
  splitting: false,
  format: "esm",
  outdir: outdir,
  color: true,
  sourcemap: true,
  mainFields: ['module'],
  // external: ['./src/utils/*', './src/helper/*', 'lit'],
  metafile: false,
  chunkNames: 'chunks/[name]-[hash]',
  logLevel: "debug",
  plugins: []
}

console.log("start lib build (esbuild)");
let result = await esbuild.build(options);
console.log("end dev build (esbuild)");

// console.log("start tsc declarations");
// let result2 = await $`bunx tsc`;
// console.log(result2);
// console.log("end ts decalarations");
