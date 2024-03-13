import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/// <reference types='vitest' />
export default defineConfig(({ mode }) => ({
  root: __dirname,

  cacheDir: '../../node_modules/.vite/packages/frontend',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    nxViteTsPaths(),
    mode === 'prod'
      ? sentryVitePlugin({
          org: 'plan2gather',
          project: 'javascript-react',
          telemetry: false,
          authToken: process.env.SENTRY_RELEASE_TOKEN,
        })
      : undefined,
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  build: {
    outDir: '../../dist/packages/frontend',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    sourcemap: true,
    rollupOptions: {
      onLog(level, log, handler) {
        if (
          log.cause !== undefined &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (log.cause as any).message === `Can't resolve original location of error.`
        ) {
          return;
        }
        handler(level, log);
      },
    },
  },

  test: {
    watch: false,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/frontend',
      provider: 'v8',
    },
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['src/utils/theme-test-helper.spec.tsx'],
    setupFiles: './tests/setup.ts',
  },
}));
