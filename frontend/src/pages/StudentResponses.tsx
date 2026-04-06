import React, { useState, useMemo } from 'react';
import {
  User,
  FileText,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionnaireResponseModal from '../components/QuestionnaireResponseModal';
import type {
  QuestionnaireResponse,
  Questionnaire,
} from '../types';
import DataTable, { type Column, type ActionButton } from '../components/DataTable';
import SearchFilter from '../components/SearchFilter';
import { useStudent } from '../hooks/useStudents';
import { useQuestionnaireResponses } from '../hooks/useQuestionnaireResponses';

const StudentResponses: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const parsedStudentId = parseInt(studentId || '0');
  const { data: student = null } = useStudent(parsedStudentId);
  const { data: allResponses = [], isLoading } = useQuestionnaireResponses();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<QuestionnaireResponse | null>(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);

  const responses = useMemo(() => {
    return (allResponses || []).filter(
      (response: QuestionnaireResponse) => response.aluno_id === parsedStudentId
    );
  }, [allResponses, parsedStudentId]);

  const filteredResponses = useMemo(() => {
    if (!searchTerm) {
      return responses || [];
    }

    return (responses || []).filter((response: QuestionnaireResponse) => {
      const questionnaireName = response.questionario?.nome?.toLowerCase() || '';
      return questionnaireName.includes(searchTerm.toLowerCase());
    });
  }, [responses, searchTerm]);

  const handleViewResponse = (response: QuestionnaireResponse) => {
    setSelectedResponse(response);
    if (response.questionario) {
      setSelectedQuestionnaire(response.questionario);
    }
    setShowModal(true);
  };

  // Definição das colunas da tabela
  const responseColumns: Column<QuestionnaireResponse>[] = [
    {
      key: 'questionario',
      label: 'Questionário',
      render: (response) => (
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {response.questionario?.nome || 'Questionário não encontrado'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'data_envio',
      label: 'Data de Envio',
      render: (response) => (
        <span className="text-sm text-gray-500">
          {new Date(response.data_envio).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      )
    }
  ];

  // Definição das ações da tabela
  const responseActions: ActionButton<QuestionnaireResponse>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewResponse,
      className: "text-blue-600 hover:text-blue-900",
      title: "Visualizar resposta"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/cadastros/alunos')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Alunos
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {student?.nome || 'Aluno não encontrado'}
                </h1>
                <p className="text-gray-600 mt-1">{student?.email}</p>
                {student?.codigo && (
                  <p className="text-sm text-gray-500 mt-1">Código: {student.codigo}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total de Respostas</p>
              <p className="text-2xl font-bold text-blue-600">{responses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nome do questionário..."
      />

      {/* Lista de respostas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Respostas ({filteredResponses.length})
          </h3>
        </div>

        <DataTable
          data={filteredResponses}
          columns={responseColumns}
          actions={responseActions}
          loading={isLoading}
          emptyState={{
            icon: <FileText className="mx-auto h-12 w-12 text-gray-400" />,
            title: "Nenhuma resposta encontrada",
            description: responses.length === 0
              ? 'Este aluno ainda não respondeu nenhum questionário.'
              : 'Nenhuma resposta corresponde aos filtros aplicados.'
          }}
        />
      </div>

      {/* Modal de visualização */}
      <QuestionnaireResponseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedResponse(null);
          setSelectedQuestionnaire(null);
        }}
        response={selectedResponse}
        questionnaire={selectedQuestionnaire}
        student={student}
      />
    </div>
  );
};

export default StudentResponses;

