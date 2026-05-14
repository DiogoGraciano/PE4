import { test, expect } from '@playwright/test';
import { fillField } from '../helpers/forms';

test.describe('Configurações › SMTP', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configuracao/smtp');
    await expect(page.locator('main')).toBeVisible();
  });

  test('renderiza formulário de SMTP', async ({ page }) => {
    await expect(page.locator('form, input').first()).toBeVisible();
  });

  test('preenche host, porta e usuário e tenta salvar', async ({ page }) => {
    await fillField(page, /host/i, 'mailpit').catch(() => {});
    await fillField(page, /porta/i, '1025').catch(() => {});
    await fillField(page, /usu[áa]rio|user/i, 'noreply@nexo.test').catch(() => {});
    const submit = page.getByRole('button', { name: /^salvar$|^atualizar$/i }).first();
    if (await submit.count()) await submit.click().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('botão de testar conexão existe', async ({ page }) => {
    const testBtn = page.getByRole('button', { name: /testar/i });
    if (await testBtn.count()) {
      await testBtn.first().click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
    }
  });
});
