import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const E2E_ENV = {
  NODE_ENV: 'test',
  PORT: '3000',
  DB_HOST: process.env.E2E_DB_HOST ?? 'localhost',
  DB_PORT: process.env.E2E_DB_PORT ?? '5432',
  DB_USERNAME: process.env.E2E_DB_USERNAME ?? 'postgres',
  DB_PASSWORD: process.env.E2E_DB_PASSWORD ?? 'postgres',
  DB_NAME: process.env.E2E_DB_NAME ?? 'nexo_e2e',
  JWT_SECRET: process.env.E2E_JWT_SECRET ?? 'e2e-secret-key',
  JWT_EXPIRES_IN: '7d',
  FRONTEND_URL: process.env.E2E_FRONTEND_URL ?? 'http://localhost:5173',
  SMTP_HOST: process.env.E2E_SMTP_HOST ?? 'localhost',
  SMTP_PORT: process.env.E2E_SMTP_PORT ?? '1025',
  SMTP_USER: '',
  SMTP_PASSWORD: '',
  SMTP_FROM: 'noreply@nexo.local',
  RUN_SEEDERS: 'true',
};

export const BACKEND_DIR = path.resolve(__dirname, '../../../backend');

export const DOCKER_CFG = {
  backendDir: BACKEND_DIR,
  container: 'nexo_postgres',
  dbUser: E2E_ENV.DB_USERNAME,
  dbName: E2E_ENV.DB_NAME,
  pgPort: parseInt(E2E_ENV.DB_PORT, 10),
};
