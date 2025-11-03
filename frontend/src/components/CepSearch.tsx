import React, { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { cepService, type CepResponse } from '../services/cepService';

interface CepSearchProps {
  onCepFound: (cepData: CepResponse) => void;
  className?: string;
}

const CepSearch: React.FC<CepSearchProps> = ({ onCepFound, className = '' }) => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!cep.trim()) {
      setError('Digite um CEP para buscar');
      return;
    }

    if (!cepService.validarFormatoCep(cep)) {
      setError('CEP deve ter 8 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cepData = await cepService.buscarCep(cep);
      onCepFound(cepData);
      setCep('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar CEP');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCep(value);
    setError('');
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        CEP
      </label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={cep}
            onChange={handleCepChange}
            onKeyPress={handleKeyPress}
            placeholder="00000-000"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            maxLength={9}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !cep.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>Buscar</span>
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CepSearch;
