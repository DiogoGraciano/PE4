import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Calendar,
  Eye,
  Search,
  Filter,
  BarChart3,
  ChevronDown,
  ChevronRight,
  X,
  User,
  Clock
} from 'lucide-react';
import apiService from '../../services/api';
import type {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseData,
  QuestionField,
  Student
} from '../../types';

const QuestionnaireResponses: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<QuestionnaireResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<QuestionnaireResponse | null>(null);
  const [responseData, setResponseData] = useState<QuestionnaireResponseData>({});
  const [questionnaireFields, setQuestionnaireFields] = useState<QuestionField[]>([]);
  const [expandedStats, setExpandedStats] = useState(false);

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  useEffect(() => {
    if (selectedQuestionnaire) {
      loadResponses(selectedQuestionnaire.id);
    }
  }, [selectedQuestionnaire]);

  useEffect(() => {
    filterResponses();
  }, [responses, searchTerm]);

  const loadQuestionnaires = async () => {
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

  const loadResponses = async (questionnaireId: number) => {
    try {
      setIsLoading(true);
      const response = await apiService.getQuestionnaireResponses(questionnaireId);
      setResponses(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
      setResponses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterResponses = () => {
    if (!searchTerm) {
      setFilteredResponses(responses || []);
      return;
    }

    const filtered = (responses || []).filter(response => {
      const studentName = response.aluno?.nome?.toLowerCase() || '';
      const studentEmail = response.aluno?.email?.toLowerCase() || '';
      return studentName.includes(searchTerm.toLowerCase()) ||
             studentEmail.includes(searchTerm.toLowerCase());
    });
    setFilteredResponses(filtered);
  };

  const handleViewResponse = async (response: QuestionnaireResponse) => {
    setSelectedResponse(response);

    try {
      // Parse response data
      const data: QuestionnaireResponseData = JSON.parse(response.respostas_json);
      setResponseData(data);

      // Parse questionnaire fields
      if (response.questionario) {
        const fields: QuestionField[] = JSON.parse(response.questionario.questionario_json);
        setQuestionnaireFields(fields);
      }

      setShowDetailModal(true);
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  };

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

  const getFieldLabel = (fieldId: string) => {
    const field = questionnaireFields.find(f => f.id === fieldId);
    return field?.label || fieldId;
  };

  const calculateStats = () => {
    if (!responses || responses.length === 0) return null;

    const totalResponses = responses.length;
    const recentResponses = responses.filter(r => {
      const responseDate = new Date(r.data_envio);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return responseDate >= sevenDaysAgo;
    }).length;

    return {
      totalResponses,
      recentResponses,
      completionRate: 100 // Assuming all responses are complete
    };
  };

  const stats = calculateStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Respostas de Questionários</h1>
      </div>

      {/* Seleção de Questionário */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione um Questionário
            </label>
            <select
              value={selectedQuestionnaire?.id || ''}
              onChange={(e) => {
                const questionnaire = (questionnaires || []).find(q => q.id === parseInt(e.target.value));
                setSelectedQuestionnaire(questionnaire || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um questionário...</option>
              {(questionnaires || []).map((questionnaire) => (
                <option key={questionnaire.id} value={questionnaire.id}>
                  {questionnaire.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedQuestionnaire && (
        <>
          {/* Estatísticas */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas Gerais
                </h2>
                <button
                  onClick={() => setExpandedStats(!expandedStats)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedStats ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total de Respostas</p>
                      <p className="text-2xl font-bold text-blue-900">{stats?.totalResponses || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Respostas Recentes (7 dias)</p>
                      <p className="text-2xl font-bold text-green-900">{stats?.recentResponses || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Taxa de Conclusão</p>
                      <p className="text-2xl font-bold text-purple-900">{stats?.completionRate || 0}%</p>
                    </div>
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {expandedStats && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes do Questionário</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nome</p>
                      <p className="text-sm text-gray-900">{selectedQuestionnaire.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Criado em</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedQuestionnaire.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra de pesquisa */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome ou email do aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lista de respostas */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Envio
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(filteredResponses || []).map((response) => (
                    <tr key={response.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {response.aluno?.nome || 'Nome não disponível'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {response.aluno?.email || 'Email não disponível'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(response.data_envio).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewResponse(response)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Visualizar resposta"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredResponses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {responses.length === 0 ? 'Nenhuma resposta encontrada para este questionário.' : 'Nenhuma resposta corresponde aos filtros aplicados.'}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal de visualização detalhada */}
      {showDetailModal && selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resposta do Questionário</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedResponse.aluno?.nome} - {selectedQuestionnaire?.nome}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
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
                    <p className="text-sm text-gray-900">{selectedResponse.aluno?.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">E-mail</p>
                    <p className="text-sm text-gray-900">{selectedResponse.aluno?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Envio</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedResponse.data_envio).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo de Usuário</p>
                    <p className="text-sm text-gray-900 capitalize">{selectedResponse.aluno?.tipo_usuario}</p>
                  </div>
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
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionnaireResponses;
