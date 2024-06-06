// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';
import { TextEncoder, TextDecoder } from 'util';

const global = window as any;

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { matchers } from './src/matchers';

expect.extend(matchers);
