import { rm } from 'node:fs/promises';
import { $ } from "bun";

const outdir = './dist';

await rm(outdir, {
    recursive: true,
    force: true,
})

console.log("start tsc declarations");
let result = await $`bunx tsc`;
console.log(result);
console.log("end ts decalarations");
