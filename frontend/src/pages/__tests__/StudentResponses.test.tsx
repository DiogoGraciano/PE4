import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../../hooks/useStudents', () => ({
  useStudent: () => ({
    data: { id: 7, nome: 'Aluno Z', email: 'z@y.com', codigo: 'C001', responsavel: 'R' },
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useQuestionnaireResponses', () => ({
  useQuestionnaireResponses: () => ({
    data: [
      {
        id: 11,
        aluno_id: 7,
        questionario_id: 1,
        questionario: { id: 1, nome: 'Q One', questionario_json: '[]', created_at: '', updated_at: '' },
        respostas_json: '{}',
        data_envio: '2026-05-10T10:00:00.000Z',
        created_at: '',
        updated_at: '',
      },
    ],
    isLoading: false,
  }),
}));

import StudentResponses from '../StudentResponses';

const renderAt = () =>
  render(
    <MemoryRouter initialEntries={['/alunos/7/respostas']}>
      <Routes>
        <Route path="/alunos/:studentId/respostas" element={<StudentResponses />} />
      </Routes>
    </MemoryRouter>,
  );

describe('StudentResponses', () => {
  it('renders student name, total count and response row', () => {
    renderAt();
    expect(screen.getByText('Aluno Z')).toBeInTheDocument();
    expect(screen.getByText(/Código: C001/)).toBeInTheDocument();
    expect(screen.getAllByText('Q One').length).toBeGreaterThan(0);
  });

  it('opens response modal when Eye clicked', async () => {
    renderAt();
    await userEvent.click(screen.getAllByTitle('Visualizar resposta')[0]);
    expect(screen.getByText('Resposta do Questionário')).toBeInTheDocument();
  });

  it('navigates back on Voltar', async () => {
    renderAt();
    await userEvent.click(screen.getByRole('button', { name: /Voltar para Alunos/ }));
    expect(navigateMock).toHaveBeenCalledWith('/cadastros/alunos');
  });
});
