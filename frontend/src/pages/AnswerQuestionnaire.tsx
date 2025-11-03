import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/api';
import DynamicForm from '../components/DynamicForm';
import type { Questionnaire, QuestionField, QuestionFormData, Student } from '../types';
import { useAuth } from '../contexts/AuthContext';

const AnswerQuestionnaire: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [fields, setFields] = useState<QuestionField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadQuestionnaire();
      loadStudents();
    }
  }, [id]);

  const loadStudents = async () => {
    try {
      const response = await apiService.getStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const loadQuestionnaire = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getQuestionnaires();
      const questionnaireData = response.data?.find((q: Questionnaire) => q.id === parseInt(id || '0'));
      
      if (!questionnaireData) {
        setError('Questionário não encontrado');
        return;
      }

      setQuestionnaire(questionnaireData);
      
      try {
        const parsedFields: QuestionField[] = JSON.parse(questionnaireData.questionario_json);
        setFields(parsedFields);
      } catch (parseError) {
        setError('Erro ao processar a estrutura do questionário');
        console.error('Erro ao fazer parse do JSON:', parseError);
      }
    } catch (error) {
      console.error('Erro ao carregar questionário:', error);
      setError('Erro ao carregar questionário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: QuestionFormData) => {
    if (!questionnaire) {
      setError('Dados insuficientes para enviar a resposta');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Obter o ID do aluno
      // Prioridade: 1) selectedAlunoId, 2) URL parameter, 3) user.id
      const urlParams = new URLSearchParams(window.location.search);
      const alunoIdParam = urlParams.get('aluno_id');
      const alunoId = selectedAlunoId || (alunoIdParam ? parseInt(alunoIdParam) : user?.id);

      if (!alunoId) {
        setError('É necessário selecionar um aluno para enviar a resposta.');
        setIsSubmitting(false);
        return;
      }

      const responseData = {
        questionario_id: questionnaire.id,
        aluno_id: alunoId,
        respostas_json: JSON.stringify(formData),
        data_envio: new Date().toISOString(),
      };

      await apiService.createQuestionnaireResponse(responseData);
      
      setSubmitSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/questionarios/listar');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao enviar resposta:', error);
      setError(error.response?.data?.message || 'Erro ao enviar resposta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !questionnaire) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Erro</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/questionarios/listar')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Voltar para Questionários
          </button>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Resposta Enviada com Sucesso!
            </h2>
            <p className="text-gray-600 mb-6">
              Sua resposta foi registrada. Você será redirecionado em breve...
            </p>
            <button
              onClick={() => navigate('/questionarios/listar')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar para Questionários
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/questionarios/listar')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para Questionários
          </button>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {questionnaire?.nome}
              </h1>
            </div>
            {questionnaire?.created_at && (
              <p className="text-sm text-gray-500">
                Criado em {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Seleção de Aluno */}
        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o Aluno *
            </label>
            <select
              value={selectedAlunoId || ''}
              onChange={(e) => setSelectedAlunoId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um aluno...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nome || student.codigo} {student.email && `(${student.email})`}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Se o aluno já estiver logado, o sistema tentará usar o ID do usuário logado.
            </p>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Preencha o questionário abaixo
          </h2>
          
          <DynamicForm
            fields={fields}
            onSubmit={handleSubmit}
            submitLabel={isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
            cancelLabel="Cancelar"
            onCancel={() => navigate('/questionarios/listar')}
          />
        </div>
      </div>
    </div>
  );
};

export default AnswerQuestionnaire;

