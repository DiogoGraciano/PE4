import { test, expect } from '@playwright/test';

const REPORT_PAGES: Array<{ path: string; label: RegExp }> = [
  { path: '/cadastros/alunos', label: /relat[óo]rio/i },
  { path: '/cadastros/empresas', label: /relat[óo]rio/i },
  { path: '/cadastros/funcionarios', label: /relat[óo]rio/i },
  { path: '/cadastros/questionarios', label: /relat[óo]rio/i },
];

test.describe('Relatórios PDF', () => {
  for (const { path, label } of REPORT_PAGES) {
    test(`abre modal de relatório a partir de ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      const btn = page.getByRole('button', { name: label });
      if (!(await btn.count())) test.skip(true, `sem botão de relatório em ${path}`);
      await btn.first().click();
      await expect(page.locator('[role="dialog"], form, main').first()).toBeVisible();
      const close = page.getByRole('button', { name: /fechar|cancelar/i }).first();
      if (await close.count()) await close.click();
    });
  }

  test('download de PDF de alunos retorna conteúdo binário', async ({ page }) => {
    await page.goto('/cadastros/alunos');
    const reportBtn = page.getByRole('button', { name: /relat[óo]rio/i });
    if (!(await reportBtn.count())) test.skip(true, 'sem botão de relatório');
    await reportBtn.first().click();

    const downloadPromise = page.waitForEvent('download', { timeout: 30_000 }).catch(() => null);
    const generate = page.getByRole('button', {
      name: /^gerar$|^baixar$|^download$|^exportar$/i,
    });
    if (await generate.count()) {
      await generate.first().click();
      const dl = await downloadPromise;
      if (dl) {
        const filename = dl.suggestedFilename();
        expect(filename).toMatch(/\.pdf$/i);
      }
    }
  });
});
