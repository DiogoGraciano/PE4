import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cepService } from './cepService';

const makeResponse = (body: unknown, ok = true) =>
  ({
    ok,
    json: () => Promise.resolve(body),
  }) as unknown as Response;

describe('cepService.buscarCep', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('rejects when CEP has fewer than 8 digits', async () => {
    await expect(cepService.buscarCep('123')).rejects.toThrow('CEP deve ter 8 dígitos');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns BrasilAPI data on success', async () => {
    fetchMock.mockResolvedValueOnce(
      makeResponse({
        street: 'Rua A',
        complement: 'AP 1',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        region: 'Sudeste',
        ibge: '123',
        ddd: '11',
        siafi: '7107',
      }),
    );
    const result = await cepService.buscarCep('01001-000');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('brasilapi.com.br');
    expect(result).toMatchObject({
      cep: '01001-000',
      logradouro: 'Rua A',
      bairro: 'Centro',
      localidade: 'São Paulo',
      uf: 'SP',
      estado: 'SP',
    });
  });

  it('handles missing fields from BrasilAPI as empty strings', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse({}));
    const result = await cepService.buscarCep('01001000');
    expect(result.logradouro).toBe('');
    expect(result.complemento).toBe('');
    expect(result.gia).toBe('');
  });

  it('falls back to ViaCEP when BrasilAPI fails (non-ok)', async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse({}, false))
      .mockResolvedValueOnce(
        makeResponse({
          logradouro: 'Rua B',
          complemento: '',
          bairro: 'Bairro',
          localidade: 'Cidade',
          uf: 'RJ',
          estado: 'Rio de Janeiro',
          regiao: 'Sudeste',
          ibge: '321',
          gia: 'g',
          ddd: '21',
          siafi: 's',
        }),
      );
    const result = await cepService.buscarCep('22000000');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain('viacep.com.br');
    expect(result.uf).toBe('RJ');
  });

  it('falls back to ViaCEP when BrasilAPI throws', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(
        makeResponse({
          logradouro: 'Rua C',
          bairro: '',
          localidade: '',
          uf: '',
          estado: '',
          regiao: '',
        }),
      );
    const result = await cepService.buscarCep('11000000');
    expect(result.logradouro).toBe('Rua C');
  });

  it('throws CEP não encontrado when ViaCEP reports erro=true', async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse({}, false))
      .mockResolvedValueOnce(makeResponse({ erro: true }));
    await expect(cepService.buscarCep('99999999')).rejects.toThrow(
      'Não foi possível buscar o CEP. Tente novamente mais tarde.',
    );
  });

  it('throws final error when both providers fail', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('brasil down'))
      .mockRejectedValueOnce(new Error('viacep down'));
    await expect(cepService.buscarCep('12345678')).rejects.toThrow(
      'Não foi possível buscar o CEP',
    );
  });
});

describe('cepService validators', () => {
  it('validarFormatoCep accepts 8-digit strings (with or without mask)', () => {
    expect(cepService.validarFormatoCep('01001-000')).toBe(true);
    expect(cepService.validarFormatoCep('01001000')).toBe(true);
    expect(cepService.validarFormatoCep('123')).toBe(false);
    expect(cepService.validarFormatoCep('')).toBe(false);
  });

  it('formatarCep formats an 8-digit string', () => {
    expect(cepService.formatarCep('01001000')).toBe('01001-000');
    expect(cepService.formatarCep('01001-000')).toBe('01001-000');
  });

  it('formatarCep returns input untouched when length is wrong', () => {
    expect(cepService.formatarCep('123')).toBe('123');
  });
});
