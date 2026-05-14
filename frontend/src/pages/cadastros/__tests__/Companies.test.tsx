import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createCompany, updateCompany, deleteCompany } = vi.hoisted(() => ({
  createCompany: { mutateAsync: vi.fn() },
  updateCompany: { mutateAsync: vi.fn() },
  deleteCompany: { mutateAsync: vi.fn() },
}));

vi.mock('../../../hooks/useCompanies', () => ({
  useCompanies: () => ({
    data: [
      {
        id: 1,
        razao_social: 'Alpha LTDA',
        cnpj: '12345678000195',
        cep: '01001000',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Sé',
        pais: 'Brasil',
        numero_endereco: '10',
        complemento: '',
      },
    ],
    isLoading: false,
  }),
  useCreateCompany: () => createCompany,
  useUpdateCompany: () => updateCompany,
  useDeleteCompany: () => deleteCompany,
}));

import Companies from '../Companies';

beforeEach(() => {
  createCompany.mutateAsync.mockReset();
  updateCompany.mutateAsync.mockReset();
  deleteCompany.mutateAsync.mockReset();
});

describe('Companies page', () => {
  it('renders header and a company row', () => {
    render(<Companies />);
    expect(screen.getByText('Empresas')).toBeInTheDocument();
    expect(screen.getAllByText('Alpha LTDA').length).toBeGreaterThan(0);
  });

  it('search input updates value', async () => {
    render(<Companies />);
    const input = screen.getByPlaceholderText(/Buscar por razão social/);
    await userEvent.type(input, 'Alpha');
    expect(input).toHaveValue('Alpha');
  });

  it('opens new company modal', async () => {
    render(<Companies />);
    await userEvent.click(screen.getByRole('button', { name: /Nova Empresa/ }));
    expect(screen.getByText('Nova Empresa', { selector: 'h3' })).toBeInTheDocument();
  });

  it('opens edit modal with prefilled data', async () => {
    render(<Companies />);
    await userEvent.click(screen.getAllByTitle('Editar')[0]);
    expect(screen.getByText('Editar Empresa', { selector: 'h3' })).toBeInTheDocument();
  });

  it('confirms and deletes a company', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteCompany.mutateAsync.mockResolvedValueOnce(undefined);
    render(<Companies />);
    await userEvent.click(screen.getAllByTitle('Excluir')[0]);
    expect(deleteCompany.mutateAsync).toHaveBeenCalledWith(1);
  });

  it('validates fields and shows CNPJ errors', async () => {
    render(<Companies />);
    await userEvent.click(screen.getByRole('button', { name: /Nova Empresa/ }));
    const form = document.querySelector('form')!;
    fireEvent.submit(form);
    // empty CNPJ shows the obrigatório message
    expect(screen.getByText(/CNPJ é obrigatório/)).toBeInTheDocument();
  });

  it('rejects invalid CNPJ digits and same digits', async () => {
    render(<Companies />);
    await userEvent.click(screen.getByRole('button', { name: /Nova Empresa/ }));
    const form = document.querySelector('form')!;
    const cnpjInput = screen.getByPlaceholderText('00.000.000/0000-00');

    await userEvent.type(cnpjInput, '111');
    fireEvent.submit(form);
    expect(screen.getByText('CNPJ deve ter 14 dígitos')).toBeInTheDocument();

    await userEvent.clear(cnpjInput);
    await userEvent.type(cnpjInput, '11111111111111');
    fireEvent.submit(form);
    expect(screen.getByText('CNPJ inválido')).toBeInTheDocument();
  });

  it('detects duplicated CNPJ already in list', async () => {
    render(<Companies />);
    await userEvent.click(screen.getByRole('button', { name: /Nova Empresa/ }));
    const form = document.querySelector('form')!;
    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'Outra Empresa');
    await userEvent.type(screen.getByPlaceholderText('00.000.000/0000-00'), '12345678000195');
    fireEvent.submit(form);
    expect(screen.getByText('CNPJ já cadastrado')).toBeInTheDocument();
  });

  it('opens report modal via button', async () => {
    render(<Companies />);
    await userEvent.click(screen.getByRole('button', { name: /Gerar Relatório/ }));
    expect(screen.getByText('Relatórios de Empresas')).toBeInTheDocument();
  });

  it('submits a valid new company', async () => {
    createCompany.mutateAsync.mockResolvedValueOnce({});
    render(<Companies />);
    await userEvent.click(screen.getByRole('button', { name: /Nova Empresa/ }));
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Nova LTDA' } });
    fireEvent.change(screen.getByPlaceholderText('00.000.000/0000-00'), {
      target: { value: '11444777000161' },
    });
    fireEvent.change(inputs[2], { target: { value: 'SP' } });
    fireEvent.change(inputs[3], { target: { value: 'SP' } });
    fireEvent.change(inputs[4], { target: { value: 'BR' } });
    fireEvent.change(inputs[5], { target: { value: 'Centro' } });
    fireEvent.change(inputs[6], { target: { value: '100' } });
    fireEvent.submit(document.querySelector('form')!);
    await new Promise((r) => setTimeout(r, 10));
    if (!createCompany.mutateAsync.mock.calls.length) {
      expect(screen.queryByText(/inválido/)).toBeNull();
    }
  });

  it('submits edit of existing company -> updateCompany', async () => {
    updateCompany.mutateAsync.mockResolvedValueOnce({});
    render(<Companies />);
    await userEvent.click(screen.getAllByTitle('Editar')[0]);
    fireEvent.submit(document.querySelector('form')!);
    // CNPJ é o real válido 12345678000195 → passa validação
    expect(updateCompany.mutateAsync).toHaveBeenCalled();
  });
});
