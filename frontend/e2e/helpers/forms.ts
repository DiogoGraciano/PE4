import type { Page, Locator } from '@playwright/test';

/**
 * Localiza um input pelo texto do <label> adjacente.
 * TextInput renderiza `<div><label>{label} {required && '*'}</label><input/></div>`
 * sem `htmlFor`, então `getByLabel()` não funciona. Esta função acha o `<label>`
 * pelo texto, sobe ao container e procura o primeiro input/select/textarea descendente.
 */
export function fieldByLabel(scope: Page | Locator, label: string | RegExp) {
  const rx = typeof label === 'string' ? new RegExp(label, 'i') : label;
  return scope
    .locator('label')
    .filter({ hasText: rx })
    .locator(
      'xpath=./following-sibling::*[self::input or self::select or self::textarea][1] | ./following-sibling::*//*[self::input or self::select or self::textarea][1] | ./parent::*//*[self::input or self::select or self::textarea][1]',
    )
    .first();
}

export async function fillField(scope: Page | Locator, label: string | RegExp, value: string) {
  const el = fieldByLabel(scope, label);
  await el.waitFor({ state: 'visible', timeout: 5_000 });
  await el.fill(value);
}

export async function selectByLabel(scope: Page | Locator, label: string | RegExp, value: string) {
  const el = fieldByLabel(scope, label);
  await el.waitFor({ state: 'visible', timeout: 5_000 });
  await el.selectOption(value);
}
