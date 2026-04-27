import React, { useState } from 'react';
import { FileText, Download, X, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

export interface ReportOption {
  label: string;
  type: string;
  description?: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entity: 'companies' | 'employees' | 'students' | 'questionnaires';
  options: ReportOption[];
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const FILENAMES: Record<string, Record<string, string>> = {
  companies: { full: 'empresas_lista.pdf', 'by-state': 'empresas_por_estado.pdf' },
  employees: { full: 'funcionarios_lista.pdf', 'by-function': 'funcionarios_por_funcao.pdf' },
  students: { full: 'alunos_lista.pdf', 'with-notes': 'alunos_observacoes.pdf' },
  questionnaires: { full: 'questionarios_lista.pdf', responses: 'respostas_questionarios.pdf' },
};

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  title,
  entity,
  options,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    setSelected(null);
    setError(null);
    onClose();
  };

  const handleGenerate = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await apiService.downloadReport(entity, selected);
      const filename = FILENAMES[entity]?.[selected] ?? `relatorio_${entity}.pdf`;
      triggerDownload(blob, filename);
      handleClose();
    } catch {
      setError('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">Selecione o tipo de relatório:</p>
          <div className="space-y-2">
            {options.map((opt) => (
              <label
                key={opt.type}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selected === opt.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="report-type"
                  value={opt.type}
                  checked={selected === opt.type}
                  onChange={() => setSelected(opt.type)}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-800">{opt.label}</span>
                  {opt.description && (
                    <span className="block text-xs text-gray-500 mt-0.5">{opt.description}</span>
                  )}
                </div>
              </label>
            ))}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={!selected || loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Gerar PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
