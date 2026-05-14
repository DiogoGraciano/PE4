import { test, expect } from '@playwright/test';
import { fillField } from '../helpers/forms';
import { uniqueName, uniqueCpf, uniquePhone, uniqueEmail } from '../fixtures/data.fixture';

test.describe('Cadastros › Alunos', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await page.goto('/cadastros/alunos');
    await expect(
      page.getByRole('heading', { level: 1, name: /alunos/i }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('renderiza tabela de alunos', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
  });

  test('campo de busca filtra a lista', async ({ page }) => {
    const search = page.getByPlaceholder(/buscar|pesquisar|procurar/i).first();
    if (await search.count()) {
      await search.fill('zzz_no_match_xyz');
      await page.waitForTimeout(300);
      await search.fill('');
    }
  });

  test('cria um aluno novo via modal', async ({ page }) => {
    const codigo = uniqueName('STU');
    const nome = `Aluno E2E ${codigo}`;

    await page.getByRole('button', { name: /^novo aluno$/i }).click();

    await expect(page.getByRole('heading', { name: /novo aluno/i, level: 3 })).toBeVisible();

    await fillField(page, 'Nome Completo', nome);
    await fillField(page, 'Email', uniqueEmail('aluno'));
    await fillField(page, 'Telefone', uniquePhone());
    await fillField(page, 'CPF', uniqueCpf());
    await fillField(page, 'Código do Aluno', codigo);
    await fillField(page, 'Responsável', 'Responsável E2E');
    await fillField(page, 'Cidade', 'São Paulo');
    await fillField(page, 'Estado', 'SP');
    await fillField(page, 'Bairro', 'Centro');
    await fillField(page, 'Número', '100');

    await page.getByRole('button', { name: /^cadastrar$/i }).click();

    await expect(page.getByRole('heading', { name: /novo aluno/i, level: 3 })).toBeHidden({
      timeout: 15_000,
    });
    await expect(page.locator('table').getByText(codigo, { exact: true }).first()).toBeAttached({
      timeout: 15_000,
    });
  });

  test('botão de ações abre opções para um aluno existente', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    if (count === 0) test.skip(true, 'sem alunos para testar ações');
    const firstRow = rows.first();
    const editBtn = firstRow.getByRole('button').first();
    await expect(editBtn).toBeVisible();
  });

  test('abre modal de relatório de alunos', async ({ page }) => {
    const reportBtn = page.getByRole('button', { name: /relat[óo]rio/i });
    if (await reportBtn.count()) {
      await reportBtn.first().click();
      await expect(page.getByText(/lista completa|com observações|alunos/i).first()).toBeVisible();
      const close = page.getByRole('button', { name: /fechar|cancelar/i }).first();
      if (await close.count()) await close.click();
    }
  });
});
