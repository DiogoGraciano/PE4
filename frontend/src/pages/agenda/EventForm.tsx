import React, { useState } from 'react';
import { Building2, GraduationCap } from 'lucide-react';
import { TextInput, SelectInput, FormActions } from '../../components/inputs';
import StudentSelectModal from '../../components/StudentSelectModal';
import CompanySelectModal from '../../components/CompanySelectModal';
import type { Student, Company, EventType } from '../../types';

export interface EventFormData {
  titulo: string;
  descricao: string;
  data_inicio: string; // datetime-local string
  data_fim: string;
  tipo: EventType;
  local: string;
  observacao: string;
  aluno_id: string;
  empresa_id: string;
}

export const emptyEventForm: EventFormData = {
  titulo: '',
  descricao: '',
  data_inicio: '',
  data_fim: '',
  tipo: 'generico',
  local: '',
  observacao: '',
  aluno_id: '',
  empresa_id: '',
};

interface EventFormProps {
  formData: EventFormData;
  onFormDataChange: (data: EventFormData) => void;
  students: Student[];
  companies: Company[];
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing: boolean;
  isLoading?: boolean;
}

const typeOptions: { value: EventType; label: string }[] = [
  { value: 'visita_aluno', label: 'Visita ao Aluno' },
  { value: 'visita_empresa', label: 'Visita à Empresa' },
  { value: 'visita_ambos', label: 'Visita Aluno + Empresa' },
  { value: 'generico', label: 'Evento Genérico' },
];

const EventForm: React.FC<EventFormProps> = ({
  formData,
  onFormDataChange,
  students,
  companies,
  onSubmit,
  onCancel,
  onDelete,
  isEditing,
  isLoading = false,
}) => {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof EventFormData>(
    key: K,
    value: EventFormData[K],
  ) => {
    onFormDataChange({ ...formData, [key]: value });
  };

  const needsStudent =
    formData.tipo === 'visita_aluno' || formData.tipo === 'visita_ambos';
  const needsCompany =
    formData.tipo === 'visita_empresa' || formData.tipo === 'visita_ambos';

  const selectedStudent = students.find(
    (s) => s.id?.toString() === formData.aluno_id,
  );
  const selectedCompany = companies.find(
    (c) => c.id.toString() === formData.empresa_id,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.titulo.trim()) {
      setError('Título é obrigatório');
      return;
    }
    if (!formData.data_inicio || !formData.data_fim) {
      setError('Data de início e fim são obrigatórias');
      return;
    }
    if (new Date(formData.data_fim) <= new Date(formData.data_inicio)) {
      setError('A data de fim deve ser maior que a data de início');
      return;
    }
    if (needsStudent && !formData.aluno_id) {
      setError('Selecione um aluno para este tipo de evento');
      return;
    }
    if (needsCompany && !formData.empresa_id) {
      setError('Selecione uma empresa para este tipo de evento');
      return;
    }

    onSubmit();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label="Título"
            value={formData.titulo}
            onChange={(v) => updateField('titulo', v)}
            required
            placeholder="Ex: Visita técnica"
          />
          <SelectInput
            label="Tipo de Evento"
            value={formData.tipo}
            onChange={(v) => updateField('tipo', v as EventType)}
            options={typeOptions}
            required
            placeholder="Selecione o tipo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data/Hora Início *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.data_inicio}
              onChange={(e) => updateField('data_inicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data/Hora Fim *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.data_fim}
              onChange={(e) => updateField('data_fim', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {needsStudent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aluno *
            </label>
            <button
              type="button"
              onClick={() => setShowStudentModal(true)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-left hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {selectedStudent ? (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-900">
                    {selectedStudent.nome || selectedStudent.codigo}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Selecione um aluno</span>
              )}
              <span className="text-gray-400 text-xs">Alterar</span>
            </button>
          </div>
        )}

        {needsCompany && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa *
            </label>
            <button
              type="button"
              onClick={() => setShowCompanyModal(true)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-left hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {selectedCompany ? (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-900">
                    {selectedCompany.razao_social}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Selecione uma empresa</span>
              )}
              <span className="text-gray-400 text-xs">Alterar</span>
            </button>
          </div>
        )}

        <TextInput
          label="Local"
          value={formData.local}
          onChange={(v) => updateField('local', v)}
          placeholder="Ex: Sala de reuniões, endereço da empresa"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            rows={2}
            value={formData.descricao}
            onChange={(e) => updateField('descricao', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detalhes do evento"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observação
          </label>
          <textarea
            rows={2}
            value={formData.observacao}
            onChange={(e) => updateField('observacao', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações adicionais"
          />
        </div>

        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center pt-6 border-t">
          {isEditing && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={isLoading}
              className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Excluir
            </button>
          ) : (
            <span />
          )}
          <FormActions
            onCancel={onCancel}
            onSubmit={() => {}}
            submitLabel={isEditing ? 'Atualizar' : 'Cadastrar'}
            isLoading={isLoading}
            className="border-t-0 pt-0"
          />
        </div>
      </form>

      <StudentSelectModal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        students={students}
        selectedId={formData.aluno_id}
        onSelect={(id) => updateField('aluno_id', id)}
      />

      <CompanySelectModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        companies={companies}
        selectedId={formData.empresa_id}
        onSelect={(id) => updateField('empresa_id', id)}
      />
    </>
  );
};

export default EventForm;
