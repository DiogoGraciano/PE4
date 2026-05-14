import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateMock, createResponse } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  createResponse: { mutateAsync: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 99 },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useQuestionnaires', () => ({
  useQuestionnaires: () => ({
    data: [
      {
        id: 1,
        nome: 'Q One',
        questionario_json: JSON.stringify([
          { id: 'nome', type: 'input', label: 'Nome', required: true },
        ]),
        created_at: '2026-01-01',
        updated_at: '',
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useStudents', () => ({
  useStudents: () => ({
    data: [{ id: 5, nome: 'Aluno Z', codigo: 'C', responsavel: 'R', email: 'z@y.com' }],
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useQuestionnaireResponses', () => ({
  useCreateQuestionnaireResponse: () => createResponse,
}));

import AnswerQuestionnaire from '../AnswerQuestionnaire';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/q/:id" element={<AnswerQuestionnaire />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  navigateMock.mockReset();
  createResponse.mutateAsync.mockReset();
});

describe('AnswerQuestionnaire', () => {
  it('renders the questionnaire and student picker', () => {
    renderAt('/q/1');
    expect(screen.getByText('Q One')).toBeInTheDocument();
    expect(screen.getByText(/Selecione o Aluno/)).toBeInTheDocument();
  });

  it('submits the response and shows success', async () => {
    createResponse.mutateAsync.mockResolvedValueOnce({});
    renderAt('/q/1');
    await userEvent.selectOptions(screen.getByRole('combobox'), '5');
    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'João');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar Resposta' }));
    await waitFor(() => expect(createResponse.mutateAsync).toHaveBeenCalled());
    expect(await screen.findByText('Resposta Enviada com Sucesso!')).toBeInTheDocument();
  });

  it('shows error message on submit failure', async () => {
    createResponse.mutateAsync.mockRejectedValueOnce({
      response: { data: { message: 'falhou' } },
    });
    renderAt('/q/1');
    await userEvent.selectOptions(screen.getByRole('combobox'), '5');
    await userEvent.type(screen.getAllByRole('textbox')[0], 'João');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar Resposta' }));
    expect(await screen.findByText('falhou')).toBeInTheDocument();
  });

  it('back button navigates to questionnaires list', async () => {
    renderAt('/q/1');
    await userEvent.click(screen.getByRole('button', { name: /Voltar para Questionários/ }));
    expect(navigateMock).toHaveBeenCalledWith('/questionarios/listar');
  });

  it('after success, button navigates back', async () => {
    createResponse.mutateAsync.mockResolvedValueOnce({});
    renderAt('/q/1');
    await userEvent.selectOptions(screen.getByRole('combobox'), '5');
    await userEvent.type(screen.getAllByRole('textbox')[0], 'João');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar Resposta' }));
    await waitFor(() => screen.getByText('Resposta Enviada com Sucesso!'));
    await userEvent.click(screen.getByRole('button', { name: /Voltar para Questionários/ }));
    expect(navigateMock).toHaveBeenCalledWith('/questionarios/listar');
  });
});
