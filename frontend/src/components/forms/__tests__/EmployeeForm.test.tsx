import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EmployeeForm, { type EmployeeFormData } from '../EmployeeForm';
import { makeEmployee } from '../../../test/utils';
import type { Function as FuncType } from '../../../types';

vi.mock('../../../services/cepService', async () => {
  const actual = await vi.importActual<typeof import('../../../services/cepService')>(
    '../../../services/cepService',
  );
  return {
    ...actual,
    cepService: {
      buscarCep: vi.fn(),
      validarFormatoCep: vi.fn().mockReturnValue(true),
      formatarCep: vi.fn((c: string) => c),
    },
  };
});

const empty: EmployeeFormData = {
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  cep: '',
  cidade: '',
  estado: '',
  bairro: '',
  pais: '',
  numero_endereco: '',
  complemento: '',
  contato_empresarial: '',
  funcao_id: '',
  senha: '',
  confirmacao_senha: '',
};

const functions: FuncType[] = [
  { id: 1, codigo: 'ADM', nome_funcao: 'Administrador', created_at: '', updated_at: '' },
  { id: 2, codigo: 'PROF', nome_funcao: 'Professor', created_at: '', updated_at: '' },
];

describe('EmployeeForm', () => {
  it('renders empty state hint when no role selected', () => {
    render(
      <EmployeeForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
        functions={functions}
      />,
    );
    expect(screen.getByText(/Selecione um cargo para ver as permissões/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
  });

  it('shows permissions of selected role', () => {
    render(
      <EmployeeForm
        formData={{ ...empty, funcao_id: '1' }}
        onFormDataChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
        functions={functions}
      />,
    );
    expect(screen.getByText('Permissões desta regra')).toBeInTheDocument();
    expect(screen.getByText('Configuração SMTP')).toBeInTheDocument();
  });

  it('renders Atualizar label and optional password labels when editing', () => {
    render(
      <EmployeeForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
        functions={functions}
        editingEmployee={makeEmployee()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
    expect(
      screen.getAllByText(/deixe em branco para manter a atual/).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('updates funcao_id via SelectInput', async () => {
    const onChange = vi.fn();
    render(
      <EmployeeForm
        formData={empty}
        onFormDataChange={onChange}
        onSubmit={() => {}}
        onCancel={() => {}}
        functions={functions}
      />,
    );
    await userEvent.selectOptions(screen.getByRole('combobox'), '2');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ funcao_id: '2' }));
  });

  it('submits the form', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(
      <EmployeeForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={onSubmit}
        onCancel={() => {}}
        functions={functions}
      />,
    );
    fireEvent.submit(container.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('triggers updateField for every text input', () => {
    const onChange = vi.fn();
    render(
      <EmployeeForm
        formData={empty}
        onFormDataChange={onChange}
        onSubmit={() => {}}
        onCancel={() => {}}
        functions={functions}
      />,
    );
    const inputs = screen.getAllByRole('textbox').concat(
      Array.from(document.querySelectorAll('input[type="password"]')) as HTMLElement[],
    );
    inputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: `v${i}` } });
    });
    expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(inputs.length - 1);
  });
});
