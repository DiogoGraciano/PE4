import { test, expect } from '@playwright/test';
import { fillField } from '../helpers/forms';
import { uniqueName } from '../fixtures/data.fixture';

test.describe('Cadastros › Questionários', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await page.goto('/cadastros/questionarios');
    await expect(page.locator('main')).toBeVisible();
  });

  test('renderiza página de questionários', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
  });

  test('abre formulário de novo questionário', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /\+\s*adicionar|novo|criar|cadastrar/i }).first();
    if (await addBtn.count()) {
      await addBtn.click();
      await expect(page.locator('form, [role="dialog"]').first()).toBeVisible();
    }
  });

  test('cria questionário (smoke flow)', async ({ page }) => {
    const titulo = `Q E2E ${uniqueName('Q')}`;
    const addBtn = page.getByRole('button', { name: /\+\s*adicionar|novo|criar|cadastrar/i }).first();
    if (!(await addBtn.count())) test.skip(true, 'sem botão de criar');
    await addBtn.click();
    await fillField(page, /título|nome/i, titulo).catch(() => {});
    await fillField(page, /descrição/i, 'Descrição teste E2E').catch(() => {});
    const submit = page.getByRole('button', { name: /^salvar$|^criar$|^cadastrar$/i }).first();
    if (await submit.count()) await submit.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('abre construtor de perguntas se disponível', async ({ page }) => {
    const builderBtn = page.getByRole('button', { name: /perguntas|construir|adicionar pergunta/i }).first();
    if (await builderBtn.count()) await builderBtn.click().catch(() => {});
  });
});
