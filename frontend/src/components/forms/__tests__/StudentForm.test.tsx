import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StudentForm, { type StudentFormData } from '../StudentForm';
import { cepService } from '../../../services/cepService';
import { makeStudent } from '../../../test/utils';

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

const mocked = vi.mocked(cepService);

const empty: StudentFormData = {
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
  codigo: '',
  responsavel: '',
  observacao: '',
};

describe('StudentForm', () => {
  it('renders all inputs and Cadastrar button when creating', () => {
    render(
      <StudentForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
  });

  it('renders Atualizar when editingStudent provided', () => {
    render(
      <StudentForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
        editingStudent={makeStudent()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });

  it('emits onFormDataChange when fields are edited', async () => {
    const onChange = vi.fn();
    render(
      <StudentForm
        formData={empty}
        onFormDataChange={onChange}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );
    const textboxes = screen.getAllByRole('textbox');
    await userEvent.type(textboxes[0], 'A');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ nome: 'A' }));
  });

  it('fills address on CEP success', async () => {
    mocked.buscarCep.mockResolvedValueOnce({
      cep: '12345-678',
      logradouro: '',
      complemento: '',
      bairro: 'Centro',
      localidade: 'SP',
      uf: 'SP',
      estado: 'SP',
      regiao: '',
      ibge: '',
      gia: '',
      ddd: '',
      siafi: '',
    });
    const onChange = vi.fn();
    render(
      <StudentForm
        formData={{ ...empty, cep: '12345678' }}
        onFormDataChange={onChange}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    await new Promise((r) => setTimeout(r, 0));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ cep: '12345-678', cidade: 'SP', estado: 'SP', bairro: 'Centro' }),
    );
  });

  it('invokes onSubmit when form submits', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(
      <StudentForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />,
    );
    fireEvent.submit(container.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('invokes onCancel when Cancelar is clicked', async () => {
    const onCancel = vi.fn();
    render(
      <StudentForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={() => {}}
        onCancel={onCancel}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('triggers updateField for every text input', () => {
    const onChange = vi.fn();
    render(
      <StudentForm
        formData={empty}
        onFormDataChange={onChange}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: `v${i}` } });
    });
    expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(inputs.length - 1);
  });
});
