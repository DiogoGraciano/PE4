import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren } from 'react';

vi.mock('recharts', async () => {
  const actual = (await vi.importActual<typeof import('recharts')>('recharts'));
  return {
    ...actual,
    ResponsiveContainer: ({ children }: PropsWithChildren) => (
      <div data-testid="rc">{children}</div>
    ),
  };
});

import PlacementDonut from '../PlacementDonut';
import GrowthTrendArea from '../GrowthTrendArea';
import TopCompaniesBar from '../TopCompaniesBar';
import StudentsByStateBar from '../StudentsByStateBar';
import EventsByTypePie from '../EventsByTypePie';
import ResponsesPerQuestionnaireBar from '../ResponsesPerQuestionnaireBar';

describe('PlacementDonut', () => {
  it('shows empty state when total is 0', () => {
    render(<PlacementDonut stats={{ placed: 0, terminated: 0, unplaced: 0 }} />);
    expect(screen.getByText('Sem dados para exibir')).toBeInTheDocument();
  });

  it('renders chart when data present', () => {
    render(<PlacementDonut stats={{ placed: 1, terminated: 0, unplaced: 0 }} />);
    expect(screen.getByTestId('rc')).toBeInTheDocument();
  });
});

describe('GrowthTrendArea', () => {
  it('shows empty state when all values are 0', () => {
    render(
      <GrowthTrendArea
        data={[{ month: 'Jan/26', alunos: 0, empresas: 0, encaminhamentos: 0 }]}
      />,
    );
    expect(screen.getByText('Sem dados para exibir')).toBeInTheDocument();
  });

  it('renders chart when any value > 0', () => {
    render(
      <GrowthTrendArea
        data={[{ month: 'Jan/26', alunos: 1, empresas: 0, encaminhamentos: 0 }]}
      />,
    );
    expect(screen.getByTestId('rc')).toBeInTheDocument();
  });
});

describe('TopCompaniesBar', () => {
  it('empty state', () => {
    render(<TopCompaniesBar data={[]} />);
    expect(screen.getByText('Sem dados para exibir')).toBeInTheDocument();
  });
  it('renders chart with data', () => {
    render(<TopCompaniesBar data={[{ name: 'X', count: 3 }]} />);
    expect(screen.getByTestId('rc')).toBeInTheDocument();
  });
});

describe('StudentsByStateBar', () => {
  it('empty state', () => {
    render(<StudentsByStateBar data={[]} />);
    expect(screen.getByText('Sem dados para exibir')).toBeInTheDocument();
  });
  it('renders chart with data', () => {
    render(<StudentsByStateBar data={[{ name: 'SP', count: 5 }]} />);
    expect(screen.getByTestId('rc')).toBeInTheDocument();
  });
});

describe('EventsByTypePie', () => {
  it('empty state when total is 0', () => {
    render(
      <EventsByTypePie
        data={[
          { type: 'visita_aluno', label: 'A', count: 0 },
          { type: 'visita_empresa', label: 'B', count: 0 },
          { type: 'visita_ambos', label: 'C', count: 0 },
          { type: 'generico', label: 'D', count: 0 },
        ]}
      />,
    );
    expect(screen.getByText('Sem dados para exibir')).toBeInTheDocument();
  });
  it('renders chart when any count > 0', () => {
    render(
      <EventsByTypePie
        data={[
          { type: 'visita_aluno', label: 'A', count: 1 },
          { type: 'visita_empresa', label: 'B', count: 0 },
          { type: 'visita_ambos', label: 'C', count: 0 },
          { type: 'generico', label: 'D', count: 0 },
        ]}
      />,
    );
    expect(screen.getByTestId('rc')).toBeInTheDocument();
  });
});

describe('ResponsesPerQuestionnaireBar', () => {
  it('empty state when no data', () => {
    render(<ResponsesPerQuestionnaireBar data={[{ name: 'q1', count: 0 }]} />);
    expect(screen.getByText('Sem dados para exibir')).toBeInTheDocument();
  });
  it('renders chart with data', () => {
    render(<ResponsesPerQuestionnaireBar data={[{ name: 'q1', count: 3 }]} />);
    expect(screen.getByTestId('rc')).toBeInTheDocument();
  });
});

