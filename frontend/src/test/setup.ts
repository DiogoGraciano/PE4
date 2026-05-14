import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

const installStorage = (name: 'localStorage' | 'sessionStorage') => {
  const value = new MemoryStorage();
  Object.defineProperty(window, name, { value, writable: true, configurable: true });
  Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
};

installStorage('localStorage');
installStorage('sessionStorage');

afterEach(() => {
  cleanup();
  installStorage('localStorage');
  installStorage('sessionStorage');
  vi.restoreAllMocks();
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  if (!('IntersectionObserver' in window)) {
    class IntersectionObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn().mockReturnValue([]);
    }
    (window as unknown as { IntersectionObserver: typeof IntersectionObserverMock }).IntersectionObserver =
      IntersectionObserverMock;
  }

  if (!('ResizeObserver' in window)) {
    class ResizeObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    (window as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver = ResizeObserverMock;
  }

  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  }
}

beforeEach(() => {
  delete (window as unknown as { location?: Location }).location;
  (window as unknown as {
    location: {
      href: string;
      origin: string;
      protocol: string;
      host: string;
      hostname: string;
      port: string;
      pathname: string;
      search: string;
      hash: string;
      assign: ReturnType<typeof vi.fn>;
      replace: ReturnType<typeof vi.fn>;
      reload: ReturnType<typeof vi.fn>;
    };
  }).location = {
    href: 'http://localhost/',
    origin: 'http://localhost',
    protocol: 'http:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  };
});
