// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { matchers } from './src/gcopypaste/public/test/matchers';

expect.extend(matchers);
