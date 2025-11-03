export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface CepError {
  message: string;
  code?: string;
}

class CepService {
  private async fetchWithTimeout(url: string, timeout: number = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async buscarCep(cep: string): Promise<CepResponse> {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    // Formata o CEP para exibição
    const formattedCep = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;

    try {
      // Primeira tentativa: BrasilAPI
      const brasilApiUrl = `https://brasilapi.com.br/api/cep/v2/${cleanCep}`;
      const brasilApiResponse = await this.fetchWithTimeout(brasilApiUrl);
      
      if (brasilApiResponse.ok) {
        const data = await brasilApiResponse.json();
        return {
          cep: formattedCep,
          logradouro: data.street || '',
          complemento: data.complement || '',
          bairro: data.neighborhood || '',
          localidade: data.city || '',
          uf: data.state || '',
          estado: data.state || '',
          regiao: data.region || '',
          ibge: data.ibge || '',
          gia: '',
          ddd: data.ddd || '',
          siafi: data.siafi || ''
        };
      }
    } catch (error) {
      console.log('BrasilAPI falhou, tentando ViaCEP...');
    }

    try {
      // Segunda tentativa: ViaCEP
      const viaCepUrl = `https://viacep.com.br/ws/${cleanCep}/json/`;
      const viaCepResponse = await this.fetchWithTimeout(viaCepUrl);
      
      if (viaCepResponse.ok) {
        const data = await viaCepResponse.json();
        
        if (data.erro) {
          throw new Error('CEP não encontrado');
        }

        return {
          cep: formattedCep,
          logradouro: data.logradouro || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          localidade: data.localidade || '',
          uf: data.uf || '',
          estado: data.estado || '',
          regiao: data.regiao || '',
          ibge: data.ibge || '',
          gia: data.gia || '',
          ddd: data.ddd || '',
          siafi: data.siafi || ''
        };
      }
    } catch (error) {
      console.log('ViaCEP também falhou');
    }

    throw new Error('Não foi possível buscar o CEP. Tente novamente mais tarde.');
  }

  // Método para validar formato de CEP
  validarFormatoCep(cep: string): boolean {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.length === 8;
  }

  // Método para formatar CEP
  formatarCep(cep: string): string {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
    }
    return cep;
  }
}

export const cepService = new CepService();
