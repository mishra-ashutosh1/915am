import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

const originalURL = globalThis.URL;

Object.defineProperty(globalThis, 'URL', {
  value: class MockURL {
    static createObjectURL = vi.fn(() => 'blob:mock');
    static revokeObjectURL = vi.fn();
    constructor(url: string, base?: string) {
      return new originalURL(url, base);
    }
  },
  writable: true,
});

HTMLAnchorElement.prototype.click = vi.fn();