import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createEmployee, updateEmployee, deleteEmployee } = vi.hoisted(() => ({
  createEmployee: { mutateAsync: vi.fn() },
  updateEmployee: { mutateAsync: vi.fn() },
  deleteEmployee: { mutateAsync: vi.fn() },
}));

vi.mock('../../../hooks/useEmployees', () => ({
  useEmployees: () => ({
    data: [
      {
        id: 1,
        nome: 'Func A',
        email: 'a@x.com',
        cpf: '11122233344',
        telefone: '1199',
        funcao_id: 1,
        contato_empresarial: '',
        cep: '', cidade: '', estado: '', bairro: '', pais: '',
        numero_endereco: '', complemento: '', senha: '', confirmacao_senha: '',
      },
    ],
    isLoading: false,
  }),
  useCreateEmployee: () => createEmployee,
  useUpdateEmployee: () => updateEmployee,
  useDeleteEmployee: () => deleteEmployee,
}));

vi.mock('../../../hooks/useFunctions', () => ({
  useFunctions: () => ({
    data: [{ id: 1, codigo: 'ADM', nome_funcao: 'Admin', created_at: '', updated_at: '' }],
  }),
}));

import Employees from '../Employees';

beforeEach(() => {
  createEmployee.mutateAsync.mockReset();
  updateEmployee.mutateAsync.mockReset();
  deleteEmployee.mutateAsync.mockReset();
});

describe('Employees page', () => {
  it('renders header and an employee row', () => {
    render(<Employees />);
    expect(screen.getByText('Funcionários')).toBeInTheDocument();
    expect(screen.getAllByText('Func A').length).toBeGreaterThan(0);
  });

  it('opens new modal', async () => {
    render(<Employees />);
    await userEvent.click(screen.getByRole('button', { name: /Novo Funcionário/ }));
    expect(screen.getByText('Novo Funcionário', { selector: 'h3' })).toBeInTheDocument();
  });

  it('opens edit modal', async () => {
    render(<Employees />);
    await userEvent.click(screen.getAllByTitle('Editar')[0]);
    expect(screen.getByText('Editar Funcionário', { selector: 'h3' })).toBeInTheDocument();
  });

  it('confirms and deletes an employee', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteEmployee.mutateAsync.mockResolvedValueOnce(undefined);
    render(<Employees />);
    await userEvent.click(screen.getAllByTitle('Excluir')[0]);
    expect(deleteEmployee.mutateAsync).toHaveBeenCalledWith(1);
  });

  it('opens report modal via button', async () => {
    render(<Employees />);
    await userEvent.click(screen.getByRole('button', { name: /Gerar Relatório/ }));
    expect(screen.getByText('Relatórios de Funcionários')).toBeInTheDocument();
  });

  it('submits new employee and calls createEmployee', async () => {
    createEmployee.mutateAsync.mockResolvedValueOnce({});
    render(<Employees />);
    await userEvent.click(screen.getByRole('button', { name: /Novo Funcionário/ }));
    fireEvent.submit(document.querySelector('form')!);
    // Form has required password mismatch check; we submitted with empty senha/confirmacao = match (both '')
    expect(createEmployee.mutateAsync).toHaveBeenCalled();
  });

  it('alerts when passwords do not match', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Employees />);
    await userEvent.click(screen.getByRole('button', { name: /Novo Funcionário/ }));
    // type into the two password inputs (they are not exposed via getByRole textbox)
    const passwordInputs = Array.from(
      document.querySelectorAll('input[type="password"]'),
    ) as HTMLInputElement[];
    fireEvent.change(passwordInputs[0], { target: { value: 'aaa' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'bbb' } });
    fireEvent.submit(document.querySelector('form')!);
    expect(alertSpy).toHaveBeenCalledWith('As senhas não coincidem!');
  });

  it('submits edit with empty password keeps stable update', async () => {
    updateEmployee.mutateAsync.mockResolvedValueOnce({});
    render(<Employees />);
    await userEvent.click(screen.getAllByTitle('Editar')[0]);
    fireEvent.submit(document.querySelector('form')!);
    expect(updateEmployee.mutateAsync).toHaveBeenCalled();
  });
});
