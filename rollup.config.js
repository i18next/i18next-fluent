import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import { argv } from 'yargs';

const format = argv.format || argv.f || 'iife';
const compress = argv.uglify;

const babelOptions = {
  babelrc: false
};

const file = {
  amd: `dist/amd/i18nextFluent${compress ? '.min' : ''}.js`,
  umd: `dist/umd/i18nextFluent${compress ? '.min' : ''}.js`,
  iife: `dist/iife/i18nextFluent${compress ? '.min' : ''}.js`
}[format];

export default {
  input: 'src/index.js',
  plugins: [
    babel(babelOptions),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({})
  ].concat(compress ? terser() : []),
  //moduleId: 'i18nextXHRBackend',
  output: {
    name: 'i18nextFluent',
    format,
    file
  }
};
