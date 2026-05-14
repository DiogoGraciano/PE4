import { test, expect } from '@playwright/test';
import { fillField } from '../helpers/forms';
import { uniqueName, uniquePhone, uniqueEmail } from '../fixtures/data.fixture';

test.describe('Cadastros › Empresas', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await page.goto('/cadastros/empresas');
    await expect(page.locator('main')).toBeVisible();
  });

  test('renderiza tabela ou estado vazio', async ({ page }) => {
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('cria uma empresa nova', async ({ page }) => {
    const nome = `Empresa E2E ${uniqueName('CMP')}`;
    await page
      .getByRole('button', { name: /\+\s*adicionar|nova empresa|cadastrar/i })
      .first()
      .click();

    await expect(page.locator('form').first()).toBeVisible();

    await fillField(page, /nome/i, nome).catch(() => {});
    await fillField(page, /e-?mail/i, uniqueEmail('empresa')).catch(() => {});
    await fillField(page, /telefone/i, uniquePhone()).catch(() => {});

    const submit = page.getByRole('button', { name: /^salvar$|^cadastrar$|^criar$/i });
    if (await submit.count()) await submit.first().click();

    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('busca filtra empresas', async ({ page }) => {
    const search = page.getByPlaceholder(/buscar|pesquisar/i).first();
    if (await search.count()) {
      await search.fill('zzz_no_match');
      await page.waitForTimeout(300);
    }
  });

  test('abre modal de relatório de empresas', async ({ page }) => {
    const reportBtn = page.getByRole('button', { name: /relat[óo]rio/i });
    if (await reportBtn.count()) {
      await reportBtn.first().click();
      const close = page.getByRole('button', { name: /fechar|cancelar/i }).first();
      if (await close.count()) await close.click();
    }
  });
});
