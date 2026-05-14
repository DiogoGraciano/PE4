import { test, expect } from '@playwright/test';

test.describe('Questionários › Listar e Responder', () => {
  test('lista questionários disponíveis para responder', async ({ page }) => {
    await page.goto('/questionarios/listar');
    await expect(page.locator('main')).toBeVisible();
  });

  test('navega para tela de responder questionário se houver itens', async ({ page }) => {
    await page.goto('/questionarios/listar');
    await expect(page.locator('main')).toBeVisible();
    const respondBtn = page.locator('table button[title="Responder"]').first();
    const count = await respondBtn.count();
    if (count === 0) test.skip(true, 'sem questionários para responder');
    await respondBtn.click();
    await expect(page).toHaveURL(/\/questionarios\/responder\//);
  });

  test('tela de responder /questionarios/responder/:id carrega', async ({ page }) => {
    await page.goto('/questionarios/responder/1');
    await expect(page.locator('main')).toBeVisible();
  });
});
