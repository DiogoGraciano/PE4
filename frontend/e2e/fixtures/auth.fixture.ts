import { test as base, type Page } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { SEED_USERS, type SeedRole } from './data.fixture';

type Fixtures = {
  api: ApiClient;
  loginAs: (role: SeedRole) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  api: async ({}, use) => {
    const client = await ApiClient.create();
    await use(client);
    await client.dispose();
  },

  loginAs: async ({ page, context }, use) => {
    const fn = async (role: SeedRole) => {
      await context.clearCookies();
      await page.goto('/login');
      await page.evaluate(() => {
        try {
          localStorage.clear();
        } catch {}
      });
      await page.goto('/login');
      const creds = SEED_USERS[role];
      await page.getByLabel(/e-?mail/i).fill(creds.email);
      await page.getByLabel(/senha/i).fill(creds.password);
      await page.getByRole('button', { name: /^entrar$/i }).click();
      await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 });
    };
    await use(fn);
  },
});

export { expect } from '@playwright/test';

export async function logout(page: Page) {
  const logoutBtn = page.getByRole('button', { name: /sair|logout/i });
  if (await logoutBtn.count()) await logoutBtn.first().click();
}
