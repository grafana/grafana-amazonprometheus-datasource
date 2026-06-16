// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';
import { TextEncoder, TextDecoder } from 'util';

if (typeof window !== 'undefined' && !window.grafanaBootData) {
  window.grafanaBootData = {
    settings: {
      featureToggles: {},
    },
    user: {
      locale: 'en-US',
    },
    navTree: [],
  };
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { matchers } from './src/matchers';

expect.extend(matchers);
