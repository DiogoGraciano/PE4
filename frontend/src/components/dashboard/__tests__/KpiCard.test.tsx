import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import KpiCard from '../KpiCard';

describe('KpiCard', () => {
  it.each(['blue', 'green', 'purple', 'amber', 'indigo', 'rose'] as const)(
    'renders title, value, icon for color %s',
    (color) => {
      render(
        <KpiCard title="Alunos" value={42} icon={<span data-testid="icon" />} color={color} />,
      );
      expect(screen.getByText('Alunos')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    },
  );

  it('renders string values', () => {
    render(<KpiCard title="X" value="—" icon={<span />} color="blue" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
