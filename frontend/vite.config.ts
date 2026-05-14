/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import istanbul from 'vite-plugin-istanbul'

const coverageEnabled = process.env.VITE_COVERAGE === 'true'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    coverageEnabled && istanbul({
      include: 'src/**/*.{ts,tsx}',
      exclude: ['node_modules', 'e2e', '**/*.d.ts', 'src/test/**'],
      extension: ['.ts', '.tsx'],
      requireEnv: false,
      forceBuildInstrument: false,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: {
        config: true,
      },
      manifest: {
        name: 'NEXO',
        short_name: 'NEXO',
        description: 'Sistema de Gestão Nexo',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          { src: 'pwa-64x64.png',             sizes: '64x64',   type: 'image/png' },
          { src: 'pwa-192x192.png',            sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png',            sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png',  sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache' },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e/**', '**/*.d.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.d.ts',
        'src/assets/**',
        'src/test/**',
        'src/**/index.ts',
      ],
    },
  },
})
