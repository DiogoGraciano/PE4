import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';

test.describe('Alunos › Respostas individuais', () => {
  let studentId = 1;

  test.beforeAll(async () => {
    const api = await ApiClient.create();
    try {
      const list = await api.get<{ data: any[] }>('/students');
      const arr = (list as any).data ?? list;
      if (Array.isArray(arr) && arr.length > 0 && arr[0].id) studentId = arr[0].id;
    } catch {
      /* mantém id padrão */
    } finally {
      await api.dispose();
    }
  });

  test('rota /alunos/:id/respostas renderiza', async ({ page }) => {
    await page.goto(`/alunos/${studentId}/respostas`);
    await expect(page.locator('main')).toBeVisible();
  });
});
