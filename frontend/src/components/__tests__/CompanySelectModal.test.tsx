import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CompanySelectModal from '../CompanySelectModal';
import { makeCompany } from '../../test/utils';

const buildCompanies = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    makeCompany({
      id: i + 1,
      razao_social: `Empresa ${i + 1}`,
      cnpj: String(10000000000000 + i).padStart(14, '0'),
    }),
  );

describe('CompanySelectModal', () => {
  it('renders companies and filters by razão social', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <CompanySelectModal
        isOpen
        onClose={onClose}
        onSelect={onSelect}
        selectedId=""
        companies={[
          makeCompany({ id: 1, razao_social: 'Alpha' }),
          makeCompany({ id: 2, razao_social: 'Beta' }),
        ]}
      />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/Buscar/), 'alpha');
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('filters by CNPJ digits', async () => {
    render(
      <CompanySelectModal
        isOpen
        onClose={() => {}}
        onSelect={() => {}}
        selectedId=""
        companies={[
          makeCompany({ id: 1, cnpj: '11111111000111', razao_social: 'X' }),
          makeCompany({ id: 2, cnpj: '22222222000222', razao_social: 'Y' }),
        ]}
      />,
    );
    await userEvent.type(screen.getByPlaceholderText(/Buscar/), '2222');
    expect(screen.queryByText('X')).not.toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <CompanySelectModal
        isOpen
        onClose={() => {}}
        onSelect={() => {}}
        selectedId=""
        companies={[]}
      />,
    );
    expect(screen.getByText('Nenhuma empresa encontrada')).toBeInTheDocument();
  });

  it('paginates when more than 5 companies', async () => {
    render(
      <CompanySelectModal
        isOpen
        onClose={() => {}}
        onSelect={() => {}}
        selectedId=""
        companies={buildCompanies(7)}
      />,
    );
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    // Find next-page button (last one before clear, has no name)
    const next = buttons[buttons.length - 1];
    await userEvent.click(next);
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('selecting a company emits id and closes', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <CompanySelectModal
        isOpen
        onClose={onClose}
        onSelect={onSelect}
        selectedId="1"
        companies={[makeCompany({ id: 1, razao_social: 'X' })]}
      />,
    );
    await userEvent.click(screen.getByText('X'));
    expect(onSelect).toHaveBeenCalledWith('1');
    expect(onClose).toHaveBeenCalled();
  });

  it('clear removes selection', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <CompanySelectModal
        isOpen
        onClose={onClose}
        onSelect={onSelect}
        selectedId="1"
        companies={[makeCompany({ id: 1, razao_social: 'X' })]}
      />,
    );
    await userEvent.click(screen.getByText(/Remover empresa selecionada/));
    expect(onSelect).toHaveBeenCalledWith('');
    expect(onClose).toHaveBeenCalled();
  });
});
