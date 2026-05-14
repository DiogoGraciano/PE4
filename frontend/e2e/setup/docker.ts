import { execSync, spawnSync } from 'node:child_process';

export type DockerConfig = {
  backendDir: string;
  container: string;
  dbUser: string;
  dbName: string;
  pgPort: number;
};

const sh = (cmd: string, opts: Parameters<typeof execSync>[1] = {}) =>
  execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });

function dockerComposeCmd(): string {
  // Prefer `docker compose` (plugin), fallback to legacy `docker-compose`
  const test = spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' });
  return test.status === 0 ? 'docker compose' : 'docker-compose';
}

export function ensureDockerAvailable() {
  try {
    sh('docker info');
  } catch {
    throw new Error(
      '[e2e] Docker não está rodando ou não acessível. Inicie o Docker antes de rodar os testes.',
    );
  }
}

export function bringUpPostgresAndMailpit(cfg: DockerConfig) {
  ensureDockerAvailable();
  const dc = dockerComposeCmd();
  console.log(`[e2e] subindo serviços via ${dc} (postgres, mailpit)…`);
  sh(`${dc} up -d postgres mailpit`, { cwd: cfg.backendDir, stdio: 'inherit' });
}

export async function waitForPostgresReady(cfg: DockerConfig, timeoutMs = 60_000) {
  const start = Date.now();
  console.log('[e2e] aguardando postgres aceitar conexões…');
  while (Date.now() - start < timeoutMs) {
    try {
      sh(`docker exec ${cfg.container} pg_isready -U ${cfg.dbUser}`);
      console.log('[e2e] postgres pronto');
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('[e2e] postgres não respondeu pg_isready dentro do timeout');
}

export function ensureDatabaseExists(cfg: DockerConfig) {
  console.log(`[e2e] garantindo banco "${cfg.dbName}"…`);
  const check = spawnSync(
    'docker',
    [
      'exec',
      cfg.container,
      'psql',
      '-U',
      cfg.dbUser,
      '-tAc',
      `SELECT 1 FROM pg_database WHERE datname='${cfg.dbName}'`,
    ],
    { encoding: 'utf8' },
  );
  const exists = (check.stdout || '').trim() === '1';
  if (!exists) {
    sh(
      `docker exec ${cfg.container} psql -U ${cfg.dbUser} -c 'CREATE DATABASE ${cfg.dbName}'`,
      { stdio: 'inherit' },
    );
  }
}
