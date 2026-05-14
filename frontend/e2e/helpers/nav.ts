import type { Page } from '@playwright/test';

export async function gotoMenu(page: Page, section: string, item: string) {
  await page.goto('/');
  const header = page.getByRole('button', { name: new RegExp(section, 'i') });
  if (await header.count()) {
    const isExpanded = await header.locator('svg').first().getAttribute('class');
    void isExpanded;
  }
  await page.getByRole('link', { name: new RegExp(item, 'i') }).first().click();
}

export async function openModal(page: Page, triggerLabel: string | RegExp) {
  const trigger =
    typeof triggerLabel === 'string'
      ? page.getByRole('button', { name: new RegExp(triggerLabel, 'i') })
      : page.getByRole('button', { name: triggerLabel });
  await trigger.first().click();
}

export async function closeModal(page: Page) {
  const cancel = page.getByRole('button', { name: /cancelar|fechar/i });
  if (await cancel.count()) await cancel.first().click();
  else await page.keyboard.press('Escape');
}
