import React from 'react';
import { X } from 'lucide-react';
import type {
  QuestionnaireResponse,
  QuestionnaireResponseData,
  QuestionField,
  Questionnaire,
  Student
} from '../types';

interface QuestionnaireResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: QuestionnaireResponse | null;
  questionnaire: Questionnaire | null;
  student?: Student | null;
}

const QuestionnaireResponseModal: React.FC<QuestionnaireResponseModalProps> = ({
  isOpen,
  onClose,
  response,
  questionnaire,
  student
}) => {
  if (!isOpen || !response) return null;

  let responseData: QuestionnaireResponseData = {};
  let questionnaireFields: QuestionField[] = [];

  try {
    responseData = JSON.parse(response.respostas_json);
    
    if (questionnaire) {
      questionnaireFields = JSON.parse(questionnaire.questionario_json);
    } else if (response.questionario) {
      questionnaireFields = JSON.parse(response.questionario.questionario_json);
    }
  } catch (error) {
    console.error('Erro ao processar resposta:', error);
  }

  const getFieldValue = (fieldId: string) => {
    const value = responseData[fieldId];
    if (value === undefined || value === null) return 'Não respondido';

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }

    return String(value);
  };

  const displayStudent = student || response.aluno;
  const displayQuestionnaire = questionnaire || response.questionario;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Resposta do Questionário</h2>
            <p className="text-sm text-gray-600 mt-1">
              {displayStudent?.nome} - {displayQuestionnaire?.nome}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Informações do aluno */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Informações do Aluno</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="text-sm text-gray-900">{displayStudent?.nome || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">E-mail</p>
                <p className="text-sm text-gray-900">{displayStudent?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Envio</p>
                <p className="text-sm text-gray-900">
                  {new Date(response.data_envio).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {displayStudent?.codigo && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Código</p>
                  <p className="text-sm text-gray-900">{displayStudent.codigo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Respostas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Respostas</h3>
            <div className="space-y-4">
              {(questionnaireFields || []).map((field) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                        {getFieldValue(field.id)}
                      </div>
                    </div>
                    <div className="ml-4 text-xs text-gray-500">
                      {field.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireResponseModal;

