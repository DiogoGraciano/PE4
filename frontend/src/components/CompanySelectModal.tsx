import React, { useState, useMemo } from 'react';
import { Building2, Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Modal from './Modal';
import type { Company } from '../types';

const ITEMS_PER_PAGE = 5;

interface CompanySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  selectedId: string;
  onSelect: (companyId: string) => void;
}

const CompanySelectModal: React.FC<CompanySelectModalProps> = ({
  isOpen,
  onClose,
  companies,
  selectedId,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    const term = searchTerm.toLowerCase();
    const digits = searchTerm.replace(/\D/g, '');
    return companies.filter((c) => {
      const razao = (c.razao_social || '').toLowerCase();
      const cnpj = (c.cnpj || '').replace(/\D/g, '');
      return razao.includes(term) || (digits && cnpj.includes(digits));
    });
  }, [companies, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSelect = (company: Company) => {
    onSelect(company.id.toString());
    onClose();
  };

  const handleClear = () => {
    onSelect('');
    onClose();
  };

  const formatCNPJ = (cnpj: string) => {
    const clean = cnpj.replace(/\D/g, '');
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Empresa" size="lg">
      <div className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por razão social ou CNPJ..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
        </div>

        {/* Lista */}
        <div className="border border-gray-200 rounded-md divide-y divide-gray-200 min-h-[280px]">
          {paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Building2 className="w-10 h-10 mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma empresa encontrada</p>
            </div>
          ) : (
            paged.map((company) => {
              const isSelected = selectedId === company.id.toString();
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelect(company)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{company.razao_social}</p>
                      <p className="text-xs text-gray-500">{formatCNPJ(company.cnpj)}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {/* Paginacao */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filtered.length} empresa{filtered.length !== 1 ? 's' : ''}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Botao limpar */}
        {selectedId && (
          <div className="pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remover empresa selecionada
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CompanySelectModal;
