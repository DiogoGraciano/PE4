import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

import ForgotPassword from '../ForgotPassword';
import apiService from '../../services/api';

vi.mock('../../services/api', () => ({
  default: { requestPasswordReset: vi.fn() },
}));
const api = vi.mocked(apiService);

const renderPage = () =>
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  );

describe('ForgotPassword', () => {
  it('submits the email and shows success screen', async () => {
    api.requestPasswordReset.mockResolvedValueOnce({ data: undefined, message: '', success: true });
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Digite seu e-mail'), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar instruções' }));
    await waitFor(() => expect(screen.getByText('E-mail enviado!')).toBeInTheDocument());
  });

  it('shows API error', async () => {
    api.requestPasswordReset.mockRejectedValueOnce({ response: { data: { message: 'falha' } } });
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Digite seu e-mail'), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar instruções' }));
    expect(await screen.findByText('falha')).toBeInTheDocument();
  });

  it('shows generic error when no response', async () => {
    api.requestPasswordReset.mockRejectedValueOnce(new Error('x'));
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Digite seu e-mail'), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar instruções' }));
    expect(await screen.findByText(/Erro ao enviar/)).toBeInTheDocument();
  });

  it('back to login navigates', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Voltar ao Login/ }));
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('back to login from success screen navigates', async () => {
    api.requestPasswordReset.mockResolvedValueOnce({ data: undefined, message: '', success: true });
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Digite seu e-mail'), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar instruções' }));
    await waitFor(() => screen.getByText('E-mail enviado!'));
    await userEvent.click(screen.getByRole('button', { name: /Voltar ao Login/ }));
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
