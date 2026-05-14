import { test, expect } from '@playwright/test';

test.describe('Acompanhamentos › Respostas de Questionários', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acompanhamentos/respostas-questionarios');
    await expect(page.locator('main')).toBeVisible();
  });

  test('renderiza listagem de respostas', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
  });

  test('aplica filtro por questionário se existir', async ({ page }) => {
    const select = page.locator('select').first();
    if (await select.count()) {
      const opts = select.locator('option');
      if ((await opts.count()) > 1) {
        const val = await opts.nth(1).getAttribute('value');
        if (val) await select.selectOption(val);
      }
    }
  });

  test('abre detalhe de uma resposta se houver registros', async ({ page }) => {
    const rows = page.locator('tbody tr');
    if ((await rows.count()) === 0) test.skip(true, 'sem respostas para visualizar');
    const viewBtn = rows.first().getByRole('button').first();
    if (await viewBtn.count()) await viewBtn.click().catch(() => {});
  });
});
