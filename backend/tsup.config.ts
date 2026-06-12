import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/handlers/*.ts'],
  format: ['cjs'],
  target: 'node20',
  clean: true,
  minify: true,
  splitting: false,
  sourcemap: false,
  outDir: 'build',
  // AWS SDK v3 and pg ship as separate layers or are bundled per Lambda best practices.
  // Exclude only packages guaranteed in the Lambda managed runtime.
  external: [],
});
