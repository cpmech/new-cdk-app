/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const NodeEnvironment = require('jest-environment-node');

class MyEnvironment extends NodeEnvironment {
  constructor(config) {
    super(
      Object.assign({}, config, {
        globals: Object.assign({}, config.globals, {
          Uint32Array: Uint32Array,
          Uint8Array: Uint8Array,
          ArrayBuffer: ArrayBuffer,
        }),
      }),
    );
  }

  async setup() {
    // TODO
  }

  async teardown() {
    // TODO
  }
}

module.exports = MyEnvironment;
