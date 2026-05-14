import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchFilter from '../SearchFilter';

describe('SearchFilter', () => {
  it('emits search changes', async () => {
    const onSearchChange = vi.fn();
    render(<SearchFilter searchTerm="" onSearchChange={onSearchChange} />);
    await userEvent.type(screen.getByPlaceholderText('Buscar...'), 'ab');
    expect(onSearchChange).toHaveBeenCalledTimes(2);
    expect(onSearchChange).toHaveBeenLastCalledWith('b');
  });

  it('renders actions and filters', async () => {
    const filterChange = vi.fn();
    render(
      <SearchFilter
        searchTerm="x"
        onSearchChange={() => {}}
        actions={<button>Novo</button>}
        filters={[
          {
            label: 'Estado',
            value: '',
            onChange: filterChange,
            options: [{ value: 'SP', label: 'São Paulo' }],
          },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Novo' })).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'SP');
    expect(filterChange).toHaveBeenCalledWith('SP');
  });

  it('uses custom searchPlaceholder', () => {
    render(<SearchFilter searchTerm="" onSearchChange={() => {}} searchPlaceholder="Filtrar" />);
    expect(screen.getByPlaceholderText('Filtrar')).toBeInTheDocument();
  });
});
