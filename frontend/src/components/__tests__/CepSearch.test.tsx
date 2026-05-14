import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CepSearch from '../CepSearch';
import { cepService } from '../../services/cepService';

vi.mock('../../services/cepService', async () => {
  const actual = (await vi.importActual('../../services/cepService')) as unknown as {
    cepService: typeof import('../../services/cepService').cepService;
  };
  return {
    ...actual,
    cepService: {
      buscarCep: vi.fn(),
      validarFormatoCep: vi.fn(),
      formatarCep: vi.fn(),
    },
  };
});

const mocked = vi.mocked(cepService);

const sampleResponse = {
  cep: '01001-000',
  logradouro: 'Rua A',
  complemento: '',
  bairro: 'Centro',
  localidade: 'São Paulo',
  uf: 'SP',
  estado: 'SP',
  regiao: 'Sudeste',
  ibge: '',
  gia: '',
  ddd: '11',
  siafi: '',
};

beforeEach(() => {
  mocked.buscarCep.mockReset();
  mocked.validarFormatoCep.mockReturnValue(true);
  mocked.formatarCep.mockImplementation((c) => c);
});

afterEach(() => vi.clearAllMocks());

describe('CepSearch', () => {
  it('shows validation error when CEP empty after typing then clearing', async () => {
    render(<CepSearch onCepFound={vi.fn()} />);
    const button = screen.getByRole('button', { name: /Buscar/i });
    // initially disabled (empty cep)
    expect(button).toBeDisabled();
  });

  it('shows format error when validarFormatoCep returns false', async () => {
    mocked.validarFormatoCep.mockReturnValue(false);
    render(<CepSearch onCepFound={vi.fn()} value="abc" />);
    await userEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    expect(screen.getByText('CEP deve ter 8 dígitos')).toBeInTheDocument();
  });

  it('calls onCepFound on success', async () => {
    mocked.buscarCep.mockResolvedValueOnce(sampleResponse);
    const onCepFound = vi.fn();
    render(<CepSearch onCepFound={onCepFound} value="01001000" />);
    await userEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    await waitFor(() => expect(onCepFound).toHaveBeenCalledWith(sampleResponse));
  });

  it('shows error message when service throws', async () => {
    mocked.buscarCep.mockRejectedValueOnce(new Error('falha'));
    render(<CepSearch onCepFound={vi.fn()} value="01001000" />);
    await userEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    expect(await screen.findByText('falha')).toBeInTheDocument();
  });

  it('reacts to Enter keypress', async () => {
    mocked.buscarCep.mockResolvedValueOnce(sampleResponse);
    const onCepFound = vi.fn();
    render(<CepSearch onCepFound={onCepFound} value="01001000" />);
    const input = screen.getByPlaceholderText('00000-000');
    await userEvent.type(input, '{Enter}');
    await waitFor(() => expect(onCepFound).toHaveBeenCalled());
  });
});
