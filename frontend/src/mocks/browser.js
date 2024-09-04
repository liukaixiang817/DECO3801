import { setupWorker } from 'msw/browser';  // 这里使用了 'msw/browser' 路径
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
