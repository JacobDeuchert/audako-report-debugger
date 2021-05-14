import svelte from "rollup-plugin-svelte";
import css from "rollup-plugin-css-only";
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript";
import sveltePreprocess from "svelte-preprocess";
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;


export default {
  input: './webview/main.js',
  output: {
    file: './dist/webview/bundle.js',
    sourceMap: true,
    format: 'iife',
    name: 'app'
  },
  plugins: [
    svelte(
      {
        preprocess: sveltePreprocess({ sourceMap: !production }),
        compilerOptions: {
          dev: !production
        },

      }
    ),
    css({output: 'bundle.css'}),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production
    }),
    production && terser()
  ]

}