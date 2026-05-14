let counter = 0;

export function uniqueSuffix() {
  counter += 1;
  return `${Date.now().toString(36)}_${counter}_${Math.random().toString(36).slice(2, 6)}`;
}

export function uniqueName(prefix = 'E2E') {
  return `${prefix}_${uniqueSuffix()}`;
}

export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}_${uniqueSuffix()}@example.com`.toLowerCase();
}

export function uniqueCpf() {
  let n = '';
  for (let i = 0; i < 11; i++) n += Math.floor(Math.random() * 10);
  return n;
}

export function uniqueCnpj() {
  let n = '';
  for (let i = 0; i < 14; i++) n += Math.floor(Math.random() * 10);
  return n;
}

export function uniquePhone() {
  let n = '11';
  for (let i = 0; i < 9; i++) n += Math.floor(Math.random() * 10);
  return n;
}

export const SEED_USERS = {
  admin: { email: 'admin@nexo.com', password: 'admin123', role: 'ADM' },
  prof: { email: 'professor@nexo.com', password: 'prof123', role: 'PROF' },
  coord: { email: 'coordenador@nexo.com', password: 'senha123', role: 'COORD' },
  rh: { email: 'rh@nexo.com', password: 'senha123', role: 'RH' },
  dir: { email: 'diretor@nexo.com', password: 'senha123', role: 'DIR' },
} as const;

export type SeedRole = keyof typeof SEED_USERS;
