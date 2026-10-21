import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2)).argv;
const compress = argv.compact;

const babelOptions = {
  exclude: 'node_modules/**',
  presets: [['@babel/preset-env', { modules: false }]],
  babelrc: false,
  babelHelpers: 'bundled',
};

const output = ['umd', 'amd', 'iife'].map((format) => ({
  file: `dist/${format}/i18nextFluent${compress ? '.min' : ''}.js`,
  format,
  name: 'i18nextFluent',
}));

export default {
  input: 'src/index.js',
  plugins: [babel(babelOptions), nodeResolve()].concat(compress ? terser() : []),
  output,
};
