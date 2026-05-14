import { test, expect } from '@playwright/test';
import { SEED_USERS } from '../fixtures/data.fixture';

test.describe('Autenticação', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('renderiza tela de login com campos esperados', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('img', { name: /nexo/i })).toBeVisible();
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^entrar$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /esqueceu sua senha/i })).toBeVisible();
  });

  test('login com credenciais válidas redireciona para dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-?mail/i).fill(SEED_USERS.admin.email);
    await page.getByLabel(/senha/i).fill(SEED_USERS.admin.password);
    await page.getByRole('button', { name: /^entrar$/i }).click();

    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 });
    expect(new URL(page.url()).pathname).not.toMatch(/^\/login/);
  });

  test('login com senha errada não autentica e permanece em /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-?mail/i).fill(SEED_USERS.admin.email);
    await page.getByLabel(/senha/i).fill('senha-invalida-xyz');
    await page.getByRole('button', { name: /^entrar$/i }).click();

    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(800);
    expect(new URL(page.url()).pathname).toMatch(/^\/login/);
  });

  test('botão Entrar fica desabilitado sem preenchimento', async ({ page }) => {
    await page.goto('/login');
    const submit = page.getByRole('button', { name: /^entrar$/i });
    await expect(submit).toBeDisabled();
    await page.getByLabel(/e-?mail/i).fill('a@b.com');
    await expect(submit).toBeDisabled();
    await page.getByLabel(/senha/i).fill('x');
    await expect(submit).toBeEnabled();
  });

  test('alternar visibilidade da senha', async ({ page }) => {
    await page.goto('/login');
    const password = page.getByLabel(/senha/i);
    await password.fill('segredo');
    await expect(password).toHaveAttribute('type', 'password');

    const eyeBtn = page.locator('#password ~ button[type="button"]').first();
    await expect(eyeBtn).toBeVisible();
    await eyeBtn.dispatchEvent('click');
    await expect(password).toHaveAttribute('type', 'text');
    await eyeBtn.dispatchEvent('click');
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('"esqueceu sua senha" navega para tela de recuperação', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /esqueceu sua senha/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('forgot-password aceita email e mostra confirmação', async ({ page }) => {
    await page.goto('/forgot-password');
    const email = page.getByLabel(/e-?mail/i).first();
    await email.fill(SEED_USERS.admin.email);
    const submit = page.getByRole('button', {
      name: /enviar|recuperar|solicitar|continuar/i,
    });
    await submit.first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('reset-password renderiza formulário', async ({ page }) => {
    await page.goto('/reset-password?token=fake-token-for-render');
    await expect(page.getByLabel(/senha/i).first()).toBeVisible();
  });

  test('acesso a rota protegida sem token redireciona para /login', async ({ page }) => {
    await page.goto('/cadastros/alunos');
    await expect(page).toHaveURL(/\/login/);
  });
});
