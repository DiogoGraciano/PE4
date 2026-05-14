import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  bringUpPostgresAndMailpit,
  ensureDatabaseExists,
  waitForPostgresReady,
} from './docker';
import { DOCKER_CFG, E2E_ENV, BACKEND_DIR } from './env';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skipReseed = process.env.E2E_SKIP_RESEED === 'true';
const skipDocker = process.env.E2E_SKIP_DOCKER === 'true';

async function waitForBackend(url: string, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 401 || res.status === 404) return;
    } catch {
      /* still booting */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`[e2e] backend não respondeu em ${url} após ${timeoutMs}ms`);
}

export default async function globalSetup() {
  const authDir = path.resolve(__dirname, '../.auth');
  if (!existsSync(authDir)) mkdirSync(authDir, { recursive: true });

  if (!skipDocker) {
    bringUpPostgresAndMailpit(DOCKER_CFG);
    await waitForPostgresReady(DOCKER_CFG);
    ensureDatabaseExists(DOCKER_CFG);
  } else {
    console.log('[e2e] E2E_SKIP_DOCKER=true → pulando docker compose');
  }

  if (skipReseed) {
    console.log('[e2e] E2E_SKIP_RESEED=true → pulando migrate:fresh:seed');
  } else {
    console.log('[e2e] rodando migrate:fresh:seed no banco e2e…');
    try {
      execSync('bun run migrate:fresh:seed', {
        cwd: BACKEND_DIR,
        stdio: 'inherit',
        env: { ...process.env, ...E2E_ENV },
      });
    } catch (err) {
      throw new Error(
        `[e2e] migrate:fresh:seed falhou: ${(err as Error).message}\n` +
          'Verifique se as dependências do backend estão instaladas (cd backend && bun install).',
      );
    }
  }

  const backendUrl = `http://localhost:${E2E_ENV.PORT}`;
  console.log(`[e2e] aguardando backend em ${backendUrl}…`);
  await waitForBackend(backendUrl);
  console.log('[e2e] backend pronto, iniciando suíte');
}
