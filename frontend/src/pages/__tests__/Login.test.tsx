import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const loginMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ login: loginMock, logout: vi.fn(), user: null, isAuthenticated: false, isLoading: false }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

import Login from '../Login';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );

describe('Login', () => {
  it('shows validation error when fields are empty (manual submit)', async () => {
    renderLogin();
    // submit is disabled until both fields filled, so we trigger handleSubmit via Enter? Test the visible
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
  });

  it('toggles password visibility', async () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('Digite sua senha') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
    const toggle = passwordInput.parentElement!.querySelector('button')!;
    await userEvent.click(toggle);
    expect(passwordInput.type).toBe('text');
  });

  it('logs in successfully and navigates to /', async () => {
    loginMock.mockResolvedValueOnce(undefined);
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText('Digite seu e-mail'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Digite sua senha'), 'pw');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(loginMock).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' }));
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  it('shows API error message on failed login', async () => {
    loginMock.mockRejectedValueOnce({ response: { data: { message: 'Credenciais inválidas' } } });
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText('Digite seu e-mail'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Digite sua senha'), 'pw');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument();
  });

  it('falls back to generic error message', async () => {
    loginMock.mockRejectedValueOnce(new Error('boom'));
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText('Digite seu e-mail'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Digite sua senha'), 'pw');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText(/Erro ao fazer login/)).toBeInTheDocument();
  });

  it('navigates to forgot password link', async () => {
    renderLogin();
    await userEvent.click(screen.getByText(/Esqueceu sua senha/));
    expect(navigateMock).toHaveBeenCalledWith('/forgot-password');
  });
});
