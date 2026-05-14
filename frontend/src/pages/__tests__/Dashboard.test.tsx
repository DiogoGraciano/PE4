import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren } from 'react';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: PropsWithChildren) => <div data-testid="rc">{children}</div>,
  };
});

vi.mock('../../hooks/useStudents', () => ({
  useStudents: () => ({
    data: [{ id: 1, estado: 'SP', codigo: 'A', responsavel: 'R' }],
    isLoading: false,
    isSuccess: true,
  }),
}));
vi.mock('../../hooks/useCompanies', () => ({
  useCompanies: () => ({
    data: [{ id: 1, razao_social: 'X', cnpj: '00', cep: '', cidade: '', estado: '', bairro: '', pais: '', numero_endereco: '', created_at: '', updated_at: '' }],
    isLoading: false,
    isSuccess: true,
  }),
}));
const inFifteenDays = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

vi.mock('../../hooks/useReferrals', () => ({
  useReferrals: () => ({
    data: [
      {
        id: 1,
        aluno_id: 1,
        empresa_id: 1,
        created_at: '2026-05-10T12:00:00.000Z',
        updated_at: '',
        data_desligamento: inFifteenDays,
      },
    ],
    isLoading: false,
    isSuccess: true,
  }),
}));
vi.mock('../../hooks/useQuestionnaires', () => ({
  useQuestionnaires: () => ({
    data: [{ id: 1, nome: 'Q', questionario_json: '[]', created_at: '', updated_at: '' }],
    isLoading: false,
    isSuccess: true,
  }),
}));
vi.mock('../../hooks/useQuestionnaireResponses', () => ({
  useQuestionnaireResponses: () => ({
    data: [{ id: 1, questionario_id: 1, aluno_id: 1, respostas_json: '{}', data_envio: '', created_at: '', updated_at: '' }],
    isLoading: false,
    isSuccess: true,
  }),
}));
vi.mock('../../hooks/useEvents', () => ({
  useEvents: () => ({
    data: [
      {
        id: 1,
        titulo: 'Evento',
        data_inicio: '2099-01-01T12:00:00.000Z',
        data_fim: '2099-01-01T13:00:00.000Z',
        tipo: 'generico',
        created_at: '',
        updated_at: '',
      },
    ],
    isLoading: false,
    isSuccess: true,
  }),
}));

import Dashboard from '../Dashboard';

describe('Dashboard', () => {
  it('renders KPIs, charts, alerts and recent activity', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total de Alunos')).toBeInTheDocument();
    expect(screen.getByText('Empresas Parceiras')).toBeInTheDocument();
    expect(screen.getByText('Atividade Recente')).toBeInTheDocument();
    expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
    expect(screen.getByText(/próximos do desligamento/)).toBeInTheDocument();
  });
});

describe('Dashboard loading', () => {
  it('shows spinner when any query is loading', async () => {
    vi.resetModules();
    vi.doMock('../../hooks/useStudents', () => ({
      useStudents: () => ({ data: [], isLoading: true, isSuccess: false }),
    }));
    vi.doMock('../../hooks/useCompanies', () => ({
      useCompanies: () => ({ data: [], isLoading: false, isSuccess: true }),
    }));
    vi.doMock('../../hooks/useReferrals', () => ({
      useReferrals: () => ({ data: [], isLoading: false, isSuccess: true }),
    }));
    vi.doMock('../../hooks/useQuestionnaires', () => ({
      useQuestionnaires: () => ({ data: [], isLoading: false, isSuccess: true }),
    }));
    vi.doMock('../../hooks/useQuestionnaireResponses', () => ({
      useQuestionnaireResponses: () => ({ data: [], isLoading: false, isSuccess: true }),
    }));
    vi.doMock('../../hooks/useEvents', () => ({
      useEvents: () => ({ data: [], isLoading: false, isSuccess: true }),
    }));
    const Reloaded = (await import('../Dashboard')).default;
    const { container } = render(<Reloaded />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
