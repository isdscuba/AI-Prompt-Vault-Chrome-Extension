const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['sidebar.js'],
  bundle: true,
  outfile: 'sidebar-bundle.js',
  format: 'esm',
  platform: 'browser',
  target: ['chrome96'],
  minify: false,
  sourcemap: false,
}).then(() => {
  console.log('✓ Build complete! Extension is ready to use.');
}).catch(() => process.exit(1));
