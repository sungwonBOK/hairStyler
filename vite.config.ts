import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import aitDevtools from '@apps-in-toss/devtools/unplugin';
import { localRecommendationApi } from './dev/api-plugin.ts';
export default defineConfig(({ mode }) => ({ plugins: [react(), localRecommendationApi(loadEnv(mode, process.cwd(), '')), ...(mode === 'toss' ? [aitDevtools.vite()] : [])], test: { environment: 'jsdom', setupFiles: ['./src/test-setup.ts'] } }));
