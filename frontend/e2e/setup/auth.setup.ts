import { test as setup, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_STATE = path.resolve(__dirname, '../.auth/admin.json');

setup('autenticar como administrador', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/e-?mail/i).fill('admin@nexo.com');
  await page.getByLabel(/senha/i).fill('admin123');
  await page.getByRole('button', { name: /^entrar$/i }).click();

  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 30_000,
  });

  await expect(page.locator('body')).toBeVisible();

  await page.context().storageState({ path: ADMIN_STATE });
});
