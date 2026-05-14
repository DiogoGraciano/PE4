import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

import ResetPassword from '../ResetPassword';
import apiService from '../../services/api';

vi.mock('../../services/api', () => ({
  default: { resetPassword: vi.fn() },
}));
const api = vi.mocked(apiService);

const renderWithToken = (token?: string) =>
  render(
    <MemoryRouter initialEntries={[token ? `/?token=${token}` : '/']}>
      <ResetPassword />
    </MemoryRouter>,
  );

describe('ResetPassword', () => {
  it('shows link inválido when no token in URL', async () => {
    renderWithToken(undefined);
    expect(await screen.findByText(/Link inválido/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redefinir senha' })).toBeDisabled();
  });

  it('blocks submit when password too short', async () => {
    renderWithToken('abc');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), '123');
    await userEvent.type(screen.getByPlaceholderText('Repita a nova senha'), '123');
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));
    expect(screen.getByText(/A senha deve ter no mínimo 6 caracteres/)).toBeInTheDocument();
  });

  it('blocks submit when passwords differ', async () => {
    renderWithToken('abc');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), '123456');
    await userEvent.type(screen.getByPlaceholderText('Repita a nova senha'), '654321');
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));
    expect(screen.getByText(/senhas não coincidem/)).toBeInTheDocument();
  });

  it('submits and shows success', async () => {
    api.resetPassword.mockResolvedValueOnce({ data: undefined, message: '', success: true });
    renderWithToken('tk');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), '123456');
    await userEvent.type(screen.getByPlaceholderText('Repita a nova senha'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));
    await waitFor(() => expect(screen.getByText('Senha redefinida!')).toBeInTheDocument());
  });

  it('shows API error on failure', async () => {
    api.resetPassword.mockRejectedValueOnce({ response: { data: { message: 'erro' } } });
    renderWithToken('tk');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), '123456');
    await userEvent.type(screen.getByPlaceholderText('Repita a nova senha'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));
    expect(await screen.findByText('erro')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderWithToken('tk');
    const pw = screen.getByPlaceholderText('Mínimo 6 caracteres') as HTMLInputElement;
    expect(pw.type).toBe('password');
    const toggle = pw.parentElement!.querySelector('button')!;
    await userEvent.click(toggle);
    expect(pw.type).toBe('text');
  });

  it('success navigates back to login', async () => {
    api.resetPassword.mockResolvedValueOnce({ data: undefined, message: '', success: true });
    renderWithToken('tk');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), '123456');
    await userEvent.type(screen.getByPlaceholderText('Repita a nova senha'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));
    await waitFor(() => screen.getByText('Senha redefinida!'));
    await userEvent.click(screen.getByRole('button', { name: /Ir para o Login/ }));
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
