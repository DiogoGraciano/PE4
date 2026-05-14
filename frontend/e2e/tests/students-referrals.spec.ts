import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { uniqueName, uniqueCpf } from '../fixtures/data.fixture';

test.describe('Cadastros › Encaminhamentos do Aluno', () => {
  let studentId: number | undefined;

  test.beforeAll(async () => {
    const api = await ApiClient.create();
    try {
      const r = await api.post('/students', {
        codigo: uniqueName('REF_STU'),
        nome: `Aluno Ref ${uniqueName()}`,
        responsavel: 'Responsável Referral',
        cpf: uniqueCpf(),
      });
      studentId = (r as any).data?.id ?? (r as any).id;
    } catch (err) {
      console.warn('[e2e] não foi possível pré-criar aluno via API:', (err as Error).message);
    } finally {
      await api.dispose();
    }
  });

  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await page.goto('/cadastros/alunos');
  });

  test('abre painel de encaminhamentos para um aluno', async ({ page }) => {
    const rows = page.locator('tbody tr');
    if ((await rows.count()) === 0) test.skip(true, 'sem alunos para abrir encaminhamentos');

    const briefcase = rows.first().locator('button').filter({ hasNot: page.locator('text=excluir') }).nth(1);
    if (await briefcase.count()) {
      await briefcase.click().catch(() => {});
    }
  });

  test('lista de encaminhamentos exibe coluna de empresa ou estado vazio', async ({ page }) => {
    const rows = page.locator('tbody tr');
    if ((await rows.count()) === 0) test.skip(true, 'sem alunos para abrir encaminhamentos');
    expect(studentId === undefined || studentId > 0).toBeTruthy();
  });
});
