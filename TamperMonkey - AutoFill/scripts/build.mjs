import { build, context } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const watch = process.argv.includes('--watch');

// Un seul bundle regroupant tous les formulaires (src/index.ts reexporte
// chaque src/forms/<form>). Un seul @require cote Tampermonkey suffit :
// window.TMAutofill.<Form>.init(config).
const entry = {
  in: path.join(root, 'src', 'index.ts'),
  out: 'tampermonkey-autofill',
  globalName: 'TMAutofill',
};

const options = {
  bundle: true,
  format: 'iife',
  target: 'es2020',
  sourcemap: true,
  logLevel: 'info',
  entryPoints: [entry.in],
  outfile: path.join(root, 'dist', `${entry.out}.js`),
  globalName: entry.globalName,
};

async function run() {
  if (watch) {
    const ctx = await context(options);
    await ctx.watch();
    console.log(`[watch] -> dist/${entry.out}.js (window.${entry.globalName})`);
  } else {
    await build(options);
    console.log(`[build] -> dist/${entry.out}.js (window.${entry.globalName})`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
