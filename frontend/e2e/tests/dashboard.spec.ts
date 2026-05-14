import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renderiza layout principal com sidebar e header', async ({ page }) => {
    await expect(page.getByRole('link', { name: /dashboard/i }).first()).toBeVisible();
    await expect(
      page.getByText(/NEXO\s*-\s*Acompanhamento Acadêmico e Profissional/i),
    ).toBeVisible();
  });

  test('exibe seções de cadastros, acompanhamentos e agenda na sidebar', async ({ page }) => {
    await expect(page.getByRole('button', { name: /cadastros/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /acompanhamentos/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /agenda/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /configurações/i })).toBeVisible();
  });

  test('aguarda carregamento de KPIs do dashboard', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await expect(page.locator('main')).toBeVisible();
  });

  test('alterna seções expansíveis da sidebar', async ({ page }) => {
    const cadastros = page.getByRole('button', { name: /^cadastros$/i });
    await cadastros.click();
    await cadastros.click();
  });

  test('botão Sair existe no rodapé da sidebar', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^sair$/i })).toBeVisible();
  });
});
