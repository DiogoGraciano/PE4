import { test as base, expect } from '@playwright/test';
import { SEED_USERS, type SeedRole } from '../fixtures/data.fixture';

const test = base.extend<{}>({});
test.use({ storageState: { cookies: [], origins: [] } });

async function loginAs(page: any, role: SeedRole) {
  const creds = SEED_USERS[role];
  await page.goto('/login');
  await page.getByLabel(/e-?mail/i).fill(creds.email);
  await page.getByLabel(/senha/i).fill(creds.password);
  await page.getByRole('button', { name: /^entrar$/i }).click();
  await page.waitForURL((url: URL) => !url.pathname.startsWith('/login'), { timeout: 30_000 });
}

test.describe('Controle de Acesso por Role', () => {
  for (const role of ['admin', 'prof', 'coord', 'rh', 'dir'] as SeedRole[]) {
    test(`login como ${role} chega no app autenticado`, async ({ page }) => {
      await loginAs(page, role);
      await expect(page.locator('main')).toBeVisible();
    });
  }

  test('logout limpa sessão e devolve para /login', async ({ page }) => {
    await loginAs(page, 'admin');
    const logout = page.getByRole('button', { name: /^sair$/i }).first();
    await logout.click();
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await page.goto('/cadastros/alunos');
    await expect(page).toHaveURL(/\/login/);
  });
});
