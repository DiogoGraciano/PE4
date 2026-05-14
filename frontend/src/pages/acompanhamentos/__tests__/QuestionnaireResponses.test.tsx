import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../hooks/useQuestionnaires', () => ({
  useQuestionnaires: () => ({
    data: [
      { id: 1, nome: 'Q One', questionario_json: '[]', created_at: '2026-01-01', updated_at: '' },
    ],
    isLoading: false,
  }),
}));

vi.mock('../../../hooks/useQuestionnaireResponses', () => ({
  useQuestionnaireResponses: () => ({
    data: [
      {
        id: 11,
        questionario_id: 1,
        aluno_id: 1,
        aluno: { id: 1, nome: 'Aluno X', email: 'x@y.com' },
        data_envio: '2026-05-10T10:00:00.000Z',
        respostas_json: '{}',
        created_at: '',
        updated_at: '',
      },
    ],
    isLoading: false,
  }),
}));

import QuestionnaireResponses from '../QuestionnaireResponses';

describe('QuestionnaireResponses', () => {
  it('renders header and questionnaire selector', () => {
    render(<QuestionnaireResponses />);
    expect(screen.getByText('Respostas de Questionários')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows stats and response row once a questionnaire is selected', async () => {
    render(<QuestionnaireResponses />);
    await userEvent.selectOptions(screen.getByRole('combobox'), '1');
    expect(screen.getByText('Estatísticas Gerais')).toBeInTheDocument();
    expect(screen.getByText('Aluno X')).toBeInTheDocument();
  });

  it('expands stats panel on chevron click', async () => {
    render(<QuestionnaireResponses />);
    await userEvent.selectOptions(screen.getByRole('combobox'), '1');
    const button = screen.getByText('Estatísticas Gerais').parentElement!.querySelector('button')!;
    await userEvent.click(button);
    expect(screen.getByText('Detalhes do Questionário')).toBeInTheDocument();
  });

  it('opens the response modal when Eye action clicked', async () => {
    render(<QuestionnaireResponses />);
    await userEvent.selectOptions(screen.getByRole('combobox'), '1');
    await userEvent.click(screen.getByTitle('Visualizar resposta'));
    expect(screen.getByText('Resposta do Questionário')).toBeInTheDocument();
  });
});
