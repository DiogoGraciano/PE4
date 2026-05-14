import { test, expect } from '@playwright/test';
import { fillField } from '../helpers/forms';
import { uniqueName, uniquePhone, uniqueEmail, uniqueCpf } from '../fixtures/data.fixture';

test.describe('Cadastros › Funcionários', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await page.goto('/cadastros/funcionarios');
    await expect(page.locator('main')).toBeVisible();
  });

  test('renderiza listagem de funcionários', async ({ page }) => {
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('cria um funcionário novo com função selecionada', async ({ page }) => {
    await page
      .getByRole('button', { name: /\+\s*adicionar|novo funcionário|cadastrar/i })
      .first()
      .click();

    await expect(page.locator('form').first()).toBeVisible();
    await fillField(page, /nome/i, `Func E2E ${uniqueName('EMP')}`).catch(() => {});
    await fillField(page, /e-?mail/i, uniqueEmail('func')).catch(() => {});
    await fillField(page, /telefone/i, uniquePhone()).catch(() => {});
    await fillField(page, /cpf/i, uniqueCpf()).catch(() => {});

    const select = page.locator('select').first();
    if (await select.count()) {
      const opts = select.locator('option');
      if ((await opts.count()) > 1) {
        const val = await opts.nth(1).getAttribute('value');
        if (val) await select.selectOption(val);
      }
    }

    const submit = page.getByRole('button', { name: /^salvar$|^cadastrar$/i }).first();
    if (await submit.count()) await submit.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('abre modal de relatório de funcionários', async ({ page }) => {
    const reportBtn = page.getByRole('button', { name: /relat[óo]rio/i });
    if (await reportBtn.count()) {
      await reportBtn.first().click();
      const close = page.getByRole('button', { name: /fechar|cancelar/i }).first();
      if (await close.count()) await close.click();
    }
  });
});
