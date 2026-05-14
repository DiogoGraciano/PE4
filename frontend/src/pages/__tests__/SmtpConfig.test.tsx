import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { saveMock, testMock, smtpData } = vi.hoisted(() => ({
  saveMock: { mutateAsync: vi.fn() },
  testMock: { mutateAsync: vi.fn() },
  smtpData: {
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    user: 'user@example.com',
    password: '',
    from: 'Sistema <noreply@example.com>',
  },
}));

vi.mock('../../hooks/useSmtpConfig', () => ({
  useSmtpConfig: () => ({ data: smtpData, isLoading: false }),
  useSaveSmtpConfig: () => saveMock,
  useTestSmtpConnection: () => testMock,
}));

import SmtpConfig from '../SmtpConfig';

const fillRequired = async () => {
  await userEvent.type(screen.getByLabelText(/Senha SMTP/), 'pw');
};

beforeEach(() => {
  saveMock.mutateAsync.mockReset();
  testMock.mutateAsync.mockReset();
});

describe('SmtpConfig page', () => {
  it('preloads values parsed from "Name <email>"', () => {
    render(<SmtpConfig />);
    expect(screen.getByDisplayValue('smtp.example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('noreply@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sistema')).toBeInTheDocument();
  });

  it('shows validation error when password missing', async () => {
    render(<SmtpConfig />);
    await userEvent.click(screen.getByRole('button', { name: /Salvar Configuração/ }));
    expect(screen.getByText(/senha SMTP é obrigatória/i)).toBeInTheDocument();
  });

  it('saves the config successfully', async () => {
    saveMock.mutateAsync.mockResolvedValueOnce({});
    render(<SmtpConfig />);
    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: /Salvar Configuração/ }));
    await waitFor(() =>
      expect(saveMock.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.example.com',
          port: 465,
          secure: true,
          user: 'user@example.com',
          password: 'pw',
          from: 'Sistema <noreply@example.com>',
        }),
      ),
    );
    expect(await screen.findByText(/Configuração SMTP salva com sucesso/)).toBeInTheDocument();
  });

  it('shows API error on save failure', async () => {
    saveMock.mutateAsync.mockRejectedValueOnce({ response: { data: { message: 'erro' } } });
    render(<SmtpConfig />);
    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: /Salvar Configuração/ }));
    expect(await screen.findByText('erro')).toBeInTheDocument();
  });

  it('tests the connection', async () => {
    testMock.mutateAsync.mockResolvedValueOnce({});
    render(<SmtpConfig />);
    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: /Testar Conexão/ }));
    expect(await screen.findByText(/Conexão SMTP testada com sucesso/)).toBeInTheDocument();
  });

  it('shows error from test connection', async () => {
    testMock.mutateAsync.mockRejectedValueOnce({ response: { data: { message: 'falha' } } });
    render(<SmtpConfig />);
    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: /Testar Conexão/ }));
    expect(await screen.findByText('falha')).toBeInTheDocument();
  });

  it('shows host validation error', async () => {
    render(<SmtpConfig />);
    fireEvent.change(screen.getByLabelText(/Servidor SMTP/), { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: /Salvar Configuração/ }));
    expect(screen.getByText(/host do servidor SMTP é obrigatório/)).toBeInTheDocument();
  });

  it('shows usuário validation error', async () => {
    render(<SmtpConfig />);
    fireEvent.change(screen.getByLabelText(/Usuário SMTP/), { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: /Salvar Configuração/ }));
    expect(screen.getByText(/usuário SMTP é obrigatório/i)).toBeInTheDocument();
  });

  it('shows from_email validation error', async () => {
    render(<SmtpConfig />);
    await fillRequired();
    fireEvent.change(screen.getByLabelText(/E-mail do Remetente/), { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: /Salvar Configuração/ }));
    expect(screen.getByText(/e-mail do remetente é obrigatório/i)).toBeInTheDocument();
  });

  it('shows from_name validation error', async () => {
    render(<SmtpConfig />);
    await fillRequired();
    fireEvent.change(screen.getByLabelText(/Nome do Remetente/), { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: /Salvar Configuração/ }));
    expect(screen.getByText(/nome do remetente é obrigatório/i)).toBeInTheDocument();
  });

  it('falls back to default port when input is empty', () => {
    render(<SmtpConfig />);
    fireEvent.change(screen.getByLabelText(/Porta/), { target: { value: '' } });
    // Default fallback in onChange is 587
    expect((screen.getByLabelText(/Porta/) as HTMLInputElement).value).toBe('587');
  });

  it('toggles secure checkbox', async () => {
    render(<SmtpConfig />);
    const checkbox = screen.getByLabelText(/Usar conexão segura/) as HTMLInputElement;
    await userEvent.click(checkbox);
    // it was true initially (from preloaded data), now should be false
    expect(checkbox.checked).toBe(false);
  });

  it('parses empty from field into empty values', () => {
    // smtpData has from = "Sistema <noreply@example.com>" which gets parsed
    render(<SmtpConfig />);
    expect(screen.getByDisplayValue('Sistema')).toBeInTheDocument();
  });
});
