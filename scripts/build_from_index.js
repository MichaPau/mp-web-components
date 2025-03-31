import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['index.ts'],
  bundle: true,
  outfile: './dist/out.js',
})
