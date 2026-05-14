import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DataTable, { type Column, type ActionButton } from '../DataTable';

interface Row {
  id: number;
  nome: string;
  email?: string;
}

const data: Row[] = [
  { id: 1, nome: 'Alice', email: 'a@x.com' },
  { id: 2, nome: 'Bob' },
];

const columns: Column<Row>[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email', render: (row) => row.email ?? 'n/a' },
];

describe('DataTable', () => {
  it('renders rows with values and custom render', () => {
    render(<DataTable data={data} columns={columns} />);
    expect(screen.getAllByText('Alice')).not.toHaveLength(0);
    // mobile (cards) AND desktop (table) both render the same data
    expect(screen.getAllByText('n/a').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('a@x.com').length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty state when data is empty and emptyState is provided', () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        emptyState={{
          icon: <svg data-testid="ic" />,
          title: 'Vazio',
          description: 'Sem dados',
        }}
      />,
    );
    expect(screen.getAllByText('Vazio').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sem dados').length).toBeGreaterThanOrEqual(1);
  });

  it('renders loading spinner when loading=true', () => {
    const { container } = render(<DataTable data={data} columns={columns} loading />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders action buttons and dispatches their onClick', async () => {
    const onEdit = vi.fn();
    const actions: ActionButton<Row>[] = [
      { icon: <span>edit</span>, onClick: onEdit, title: 'Editar' },
    ];
    render(<DataTable data={[data[0]]} columns={columns} actions={actions} />);
    const editButtons = screen.getAllByTitle('Editar');
    await userEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(data[0]);
  });

  it('renders Ações header only when actions present', () => {
    const { rerender } = render(<DataTable data={data} columns={columns} />);
    expect(screen.queryAllByText('Ações')).toHaveLength(0);
    rerender(
      <DataTable
        data={data}
        columns={columns}
        actions={[{ icon: <span>x</span>, onClick: vi.fn() }]}
      />,
    );
    expect(screen.getAllByText('Ações').length).toBeGreaterThanOrEqual(1);
  });
});
