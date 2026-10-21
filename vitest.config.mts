import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    unstubEnvs: true,
    unstubGlobals: true,
    include: ['./src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
    },
  },
});
