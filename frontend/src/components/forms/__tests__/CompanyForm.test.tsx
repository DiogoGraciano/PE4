import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CompanyForm, { type CompanyFormData } from '../CompanyForm';
import { cepService } from '../../../services/cepService';
import { makeCompany } from '../../../test/utils';

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

const empty: CompanyFormData = {
  razao_social: '',
  cnpj: '',
  cep: '',
  cidade: '',
  estado: '',
  bairro: '',
  pais: '',
  numero_endereco: '',
  complemento: '',
};

describe('CompanyForm', () => {
  it('renders inputs and Cadastrar by default', () => {
    render(
      <CompanyForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByPlaceholderText('00.000.000/0000-00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
  });

  it('shows Atualizar when editingCompany passed', () => {
    render(
      <CompanyForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
        editingCompany={makeCompany()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });

  it('renders provided field errors', () => {
    render(
      <CompanyForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
        errors={{ cnpj: 'CNPJ inválido', razao_social: 'obrigatório' }}
      />,
    );
    expect(screen.getByText('CNPJ inválido')).toBeInTheDocument();
    expect(screen.getByText('obrigatório')).toBeInTheDocument();
  });

  it('updates fields and CEP fill-in', async () => {
    mocked.buscarCep.mockResolvedValueOnce({
      cep: '01001-000',
      logradouro: '',
      complemento: '',
      bairro: 'Sé',
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
      <CompanyForm
        formData={{ ...empty, cep: '01001000' }}
        onFormDataChange={onChange}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );
    await userEvent.type(screen.getByPlaceholderText('00.000.000/0000-00'), '1');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ cnpj: '1' }));

    await userEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    await new Promise((r) => setTimeout(r, 0));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ cep: '01001-000', cidade: 'SP', estado: 'SP', bairro: 'Sé' }),
    );
  });

  it('submits the form on submit event', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(
      <CompanyForm
        formData={empty}
        onFormDataChange={() => {}}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />,
    );
    fireEvent.submit(container.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('triggers updateField for every text input', () => {
    const onChange = vi.fn();
    render(
      <CompanyForm
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
