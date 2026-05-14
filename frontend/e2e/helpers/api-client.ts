import { request, type APIRequestContext } from '@playwright/test';

const BACKEND_URL = process.env.E2E_BACKEND_URL ?? 'http://localhost:3000';

type Credentials = { email: string; password: string };

export class ApiClient {
  private ctx: APIRequestContext;
  private token: string | null = null;

  private constructor(ctx: APIRequestContext) {
    this.ctx = ctx;
  }

  static async create(creds: Credentials = { email: 'admin@nexo.com', password: 'admin123' }) {
    const ctx = await request.newContext({ baseURL: BACKEND_URL });
    const client = new ApiClient(ctx);
    await client.login(creds);
    return client;
  }

  async login({ email, password }: Credentials) {
    const res = await this.ctx.post('/auth', { data: { email, password } });
    if (!res.ok()) {
      throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
    }
    const body = await res.json();
    this.token = body.token;
  }

  private headers() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  async get<T = any>(path: string): Promise<T> {
    const res = await this.ctx.get(path, { headers: this.headers() });
    if (!res.ok()) throw new Error(`GET ${path} → ${res.status()}: ${await res.text()}`);
    return res.json();
  }

  async post<T = any>(path: string, data: any): Promise<T> {
    const res = await this.ctx.post(path, { headers: this.headers(), data });
    if (!res.ok()) throw new Error(`POST ${path} → ${res.status()}: ${await res.text()}`);
    return res.json();
  }

  async put<T = any>(path: string, data: any): Promise<T> {
    const res = await this.ctx.put(path, { headers: this.headers(), data });
    if (!res.ok()) throw new Error(`PUT ${path} → ${res.status()}: ${await res.text()}`);
    return res.json();
  }

  async delete(path: string) {
    const res = await this.ctx.delete(path, { headers: this.headers() });
    if (!res.ok() && res.status() !== 204) {
      throw new Error(`DELETE ${path} → ${res.status()}: ${await res.text()}`);
    }
  }

  async dispose() {
    await this.ctx.dispose();
  }
}
