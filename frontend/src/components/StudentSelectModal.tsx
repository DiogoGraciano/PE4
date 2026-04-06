import React, { useState, useMemo } from 'react';
import { GraduationCap, Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Modal from './Modal';
import type { Student } from '../types';

const ITEMS_PER_PAGE = 5;

interface StudentSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  selectedId: string;
  onSelect: (studentId: string) => void;
}

const StudentSelectModal: React.FC<StudentSelectModalProps> = ({
  isOpen,
  onClose,
  students,
  selectedId,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    const digits = searchTerm.replace(/\D/g, '');
    return students.filter((s) => {
      const nome = (s.nome || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      const codigo = (s.codigo || '').toLowerCase();
      const cpf = (s.cpf || '').replace(/\D/g, '');
      return (
        nome.includes(term) ||
        email.includes(term) ||
        codigo.includes(term) ||
        (digits && cpf.includes(digits))
      );
    });
  }, [students, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSelect = (student: Student) => {
    if (student.id !== undefined) {
      onSelect(student.id.toString());
      onClose();
    }
  };

  const handleClear = () => {
    onSelect('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Aluno" size="lg">
      <div className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nome, email, código ou CPF..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
        </div>

        {/* Lista */}
        <div className="border border-gray-200 rounded-md divide-y divide-gray-200 min-h-[280px]">
          {paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <GraduationCap className="w-10 h-10 mb-2 text-gray-300" />
              <p className="text-sm">Nenhum aluno encontrado</p>
            </div>
          ) : (
            paged.map((student) => {
              const isSelected = selectedId === student.id?.toString();
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSelect(student)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {student.nome || student.codigo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {student.email || `Código: ${student.codigo}`}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filtered.length} aluno{filtered.length !== 1 ? 's' : ''}
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

        {/* Botão limpar */}
        {selectedId && (
          <div className="pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remover aluno selecionado
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StudentSelectModal;
