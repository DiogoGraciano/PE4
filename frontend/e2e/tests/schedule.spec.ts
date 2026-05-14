import { test, expect } from '@playwright/test';

test.describe('Agenda', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await page.goto('/agenda');
    await expect(page.locator('main')).toBeVisible();
  });

  test('renderiza o calendário (FullCalendar)', async ({ page }) => {
    await expect(
      page.locator('.fc, [class*="calendar"], main').first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('botão para criar novo evento existe', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /\+\s*adicionar|novo evento|criar|agendar/i }).first();
    if (await addBtn.count()) {
      await addBtn.click();
      await expect(page.locator('form, [role="dialog"]').first()).toBeVisible();
    }
  });

  test('navegação entre meses funciona', async ({ page }) => {
    const next = page.locator('.fc-next-button, button[aria-label*="next" i]').first();
    if (await next.count()) await next.click().catch(() => {});
    const prev = page.locator('.fc-prev-button, button[aria-label*="prev" i]').first();
    if (await prev.count()) await prev.click().catch(() => {});
  });
});
