import esbuild from 'esbuild';
import { rm } from 'node:fs/promises';
import { parseArgs } from "util";

const outdir = './www/dist';

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    clearout: {
      type: 'boolean',
    },
    watchserve: {
      type: 'boolean',
    },
    log: {
      type: 'boolean',
    }
  },
  strict: true,
  allowPositionals: true,
});

let metalogPlugin = {
  name: 'metalog',
  setup(build) {
    build.onEnd((result) => {
      console.log('build ended..');
      const meta_json = JSON.stringify(result.metafile, false, 4);
      //console.log(meta_json);
      const now = new Date();
      const m = ('0' + now.getMonth()).slice(-2);
      const d = ('0' + now.getDay()).slice(-2);
      const t = now.getHours() * 360 + now.getMinutes() * 60 + now.getSeconds();
      const file_path = `./logs/${now.getFullYear()}_${m}_${d}_${t}.txt`;
      Bun.write(file_path, meta_json);
    })
  },
}


if (values["clearout"]) {
  await rm(outdir, {
      recursive: true,
      force: true,
  })
}

let options = {
  entryPoints: ['./src/**/*.ts'],
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: outdir,
  color: true,
  // external: ['./src/utils/*'],
  metafile: false,
  chunkNames: 'chunks/[name]-[hash]',
  logLevel: "debug",
  plugins: []
}

if (values["log"]) {
  options["plugins"].push(metalogPlugin);
  options["metafile"] = true;
}

let ctx = await esbuild.context(options);


if (values["watchserve"]) {
  await ctx.watch();

  let { hosts, port } = await ctx.serve({
    servedir: 'www',
  });
} else {
  await ctx.rebuild()
  ctx.dispose();
}
