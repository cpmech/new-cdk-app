import fs from 'fs';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const external = [
  'aws-sdk',
  'graphql',
  'graphql-tag',
  'graphql-tools',
  'apollo-server-lambda',
  'querystring',
  'mailparser',
  'nodemailer',
];

const cacheRoot = '/tmp/rollup_typescript_cache';

const isTest = (filename) => /\.(test|spec)\.[jt]sx?$/.test(filename);

const isJSFile = (filename) => /\.[jt]sx?$/.test(filename);

const lamDir = path.resolve(__dirname, 'src', 'lambda');

const lambdas = fs
  .readdirSync(lamDir)
  .filter((n) => !isTest(n))
  .filter((n) => isJSFile(n));

export default lambdas.map((lambda) => ({
  external,
  input: path.join('src', 'lambda', lambda),
  output: {
    file: path.join('dist', lambda.substr(0, lambda.lastIndexOf('.')) + '.js'),
    format: 'cjs',
  },
  plugins: [
    typescript({
      cacheRoot,
      typescript: require('typescript'),
      tsconfigOverride: { compilerOptions: { declaration: false } },
    }),
    resolve({
      mainFields: ['module'],
      preferBuiltins: true,
    }),
    terser(),
  ],
}));
