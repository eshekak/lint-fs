import assert from 'node:assert/strict';
import config from './config.js';

const testConfig = async ({
  fs,
  options,
  result,
  yaml,
}) => {
  assert.deepEqual(await config({
    fs,
    yaml,
  }).read(options), result);
};

const tests = [
  {
    fs: {
      readFile (fileName, encoding) {
        assert.deepEqual(fileName, './config.yaml');
        assert.deepEqual(encoding, 'utf8');

        return 'file';
      },
    },
    options: {
      encoding: 'utf8',
      fileName: './config.yaml',
    },
    result: [
      {
        ignores: [
          /^node_modules/u,
        ],
        rules: [
          /^.\/[A-Z]+.md$/u,
        ],
      },
    ],
    yaml: {
      load (file) {
        assert.deepEqual(file, 'file');

        return {
          ignores: [
            '^node_modules',
          ],
          rules: [
            '^./[A-Z]+.md$',
          ],
        };
      },
    },
  },
];

for (const test of tests) {
  testConfig(test);
}

