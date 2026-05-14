import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../../hooks/useQuestionnaires', () => ({
  useQuestionnaires: () => ({
    data: [
      {
        id: 1,
        nome: 'Q1',
        questionario_json: JSON.stringify([{ id: 'a', type: 'input', label: 'L' }]),
        created_at: '2026-01-01',
        updated_at: '',
      },
      {
        id: 2,
        nome: 'Q2',
        questionario_json: 'INVALID',
        created_at: '',
        updated_at: '',
      },
    ],
    isLoading: false,
  }),
}));

import QuestionnaireList from '../QuestionnaireList';

const renderPage = () =>
  render(
    <MemoryRouter>
      <QuestionnaireList />
    </MemoryRouter>,
  );

describe('QuestionnaireList', () => {
  it('renders header and rows; handles invalid JSON gracefully', () => {
    renderPage();
    expect(screen.getByText('Questionários Disponíveis')).toBeInTheDocument();
    expect(screen.getAllByText(/Q1/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Q2/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('1 campo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0 campos').length).toBeGreaterThan(0);
  });

  it('navigates to responder on action', async () => {
    renderPage();
    await userEvent.click(screen.getAllByTitle('Responder')[0]);
    expect(navigateMock).toHaveBeenCalledWith('/questionarios/responder/1');
  });
});
