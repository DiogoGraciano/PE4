import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import type { Questionnaire } from '../types';
import DataTable, { type Column, type ActionButton } from '../components/DataTable';
import SearchFilter from '../components/SearchFilter';

const QuestionnaireList: React.FC = () => {
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getQuestionnaires();
      setQuestionnaires(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
      setQuestionnaires([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuestionnaires = (questionnaires || []).filter(questionnaire => {
    if (!searchTerm.trim()) {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    const nome = (questionnaire.nome || '').toLowerCase();
    
    return nome.includes(searchLower);
  });

  // Definição das colunas da tabela
  const questionnaireColumns: Column<Questionnaire>[] = [
    {
      key: 'questionario',
      label: 'Questionário',
      render: (questionnaire) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {questionnaire.nome}
            </div>
            {questionnaire.created_at && (
              <div className="text-sm text-gray-500">
                Criado em {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'campos',
      label: 'Campos',
      render: (questionnaire) => {
        let fieldCount = 0;
        try {
          const fields = JSON.parse(questionnaire.questionario_json);
          fieldCount = Array.isArray(fields) ? fields.length : 0;
        } catch (error) {
          fieldCount = 0;
        }
        return (
          <span className="text-sm text-gray-500">
            {fieldCount} campo{fieldCount !== 1 ? 's' : ''}
          </span>
        );
      }
    }
  ];

  // Definição das ações da tabela
  const questionnaireActions: ActionButton<Questionnaire>[] = [
    {
      icon: <ArrowRight className="w-4 h-4" />,
      onClick: (questionnaire) => navigate(`/questionarios/responder/${questionnaire.id}`),
      className: "text-blue-600 hover:text-blue-900",
      title: "Responder"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Questionários Disponíveis</h1>
        <p className="mt-1 text-sm text-gray-600">
          Selecione um questionário para responder
        </p>
      </div>

      {/* Actions and Filters */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar questionários..."
      />

      {/* Questionnaires List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Questionários ({filteredQuestionnaires.length})
          </h3>
        </div>
        
        <DataTable
          data={filteredQuestionnaires}
          columns={questionnaireColumns}
          actions={questionnaireActions}
          loading={isLoading}
          emptyState={{
            icon: <FileText className="mx-auto h-12 w-12 text-gray-400" />,
            title: "Nenhum questionário encontrado",
            description: searchTerm
              ? 'Tente ajustar os filtros de busca.'
              : 'Não há questionários cadastrados no momento.'
          }}
        />
      </div>
    </div>
  );
};

export default QuestionnaireList;

