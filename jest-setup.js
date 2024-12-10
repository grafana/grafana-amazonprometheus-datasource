// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { matchers } from './src/matchers';

expect.extend(matchers);

window.MessageChannel = jest.fn().mockImplementation(() => {
  let onmessage;
  return {
    port1: {
      set onmessage(cb) {
        onmessage = cb;
      },
    },
    port2: {
      postMessage: (data) => {
        onmessage?.({ data });
      },
    },
  };
});
