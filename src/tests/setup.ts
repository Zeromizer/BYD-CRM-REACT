import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.gapi if needed
(globalThis as any).gapi = {
  load: () => {},
  client: {
    init: () => Promise.resolve(),
  },
  auth2: {
    getAuthInstance: () => ({
      isSignedIn: {
        get: () => false,
        listen: () => {},
      },
      signIn: () => Promise.resolve({}),
      signOut: () => Promise.resolve(),
      currentUser: {
        get: () => ({
          getAuthResponse: () => ({ access_token: 'mock-token' }),
        }),
      },
    }),
  },
};
