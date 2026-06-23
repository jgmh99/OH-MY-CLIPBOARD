import type { ClipboardApi } from './types';

declare global {
  interface Window {
    clipboardApp?: ClipboardApi;
  }
}

export {};
