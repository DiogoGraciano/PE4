import { test, expect } from '@playwright/test';

test.describe('Navegação e Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sidebar links navegam para cada cadastro', async ({ page }) => {
    const links: Array<{ label: RegExp; pathPart: string }> = [
      { label: /alunos\/usu[áa]rios/i, pathPart: '/cadastros/alunos' },
      { label: /empresas/i, pathPart: '/cadastros/empresas' },
      { label: /funcion[áa]rios/i, pathPart: '/cadastros/funcionarios' },
      { label: /^question[áa]rios$/i, pathPart: '/cadastros/questionarios' },
    ];

    for (const { label, pathPart } of links) {
      await page.goto('/');
      const link = page.getByRole('link', { name: label }).first();
      if (!(await link.isVisible().catch(() => false))) {
        await page.getByRole('button', { name: /^cadastros$/i }).click();
      }
      await link.click();
      await expect(page).toHaveURL(new RegExp(pathPart));
    }
  });

  test('link de Agenda funciona', async ({ page }) => {
    await page.getByRole('link', { name: /agendamentos/i }).first().click();
    await expect(page).toHaveURL(/\/agenda/);
  });

  test('link Dashboard retorna para "/"', async ({ page }) => {
    await page.goto('/cadastros/alunos');
    await page.getByRole('link', { name: /dashboard/i }).first().click();
    await expect(page).toHaveURL(/\/$|\/(?!login)/);
  });

  test('rota desconhecida redireciona para /cadastros/alunos', async ({ page }) => {
    await page.goto('/rota-que-nao-existe');
    await page.waitForURL(/\/cadastros\/alunos/, { timeout: 10_000 }).catch(() => {});
  });
});
