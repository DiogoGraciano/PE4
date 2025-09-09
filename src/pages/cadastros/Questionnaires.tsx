import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FileText, X, Save, Eye, Code, Palette } from 'lucide-react';
import apiService from '../../services/api';
import type { Questionnaire, QuestionField, QuestionFormData } from '../../types';
import DynamicForm from '../../components/DynamicForm';
import FormBuilder from '../../components/FormBuilder';

const Questionnaires: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewFields, setPreviewFields] = useState<QuestionField[]>([]);
  const [editMode, setEditMode] = useState<'visual' | 'json'>('visual');
  const [currentFields, setCurrentFields] = useState<QuestionField[]>([]);

  const [formData, setFormData] = useState({
    nome: '',
    questionario_json: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Campos padrão para demonstração
  const defaultFields: QuestionField[] = [
    {
      id: 'nome',
      type: 'input',
      label: 'Nome',
      required: true,
      placeholder: 'Digite seu nome'
    },
    {
      id: 'email',
      type: 'input',
      label: 'E-mail',
      required: true,
      placeholder: 'Digite seu e-mail',
      validation: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      }
    },
    {
      id: 'idade',
      type: 'select',
      label: 'Faixa etária',
      required: true,
      options: ['18-25', '26-35', '36-45', '46-55', '55+']
    },
    {
      id: 'interesses',
      type: 'checkbox',
      label: 'Interesses',
      options: ['Tecnologia', 'Saúde', 'Educação', 'Meio Ambiente', 'Arte']
    },
    {
      id: 'comentarios',
      type: 'textarea',
      label: 'Comentários adicionais',
      placeholder: 'Digite seus comentários...'
    }
  ];

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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.questionario_json.trim()) {
      newErrors.questionario_json = 'JSON do questionário é obrigatório';
    } else {
      try {
        JSON.parse(formData.questionario_json);
      } catch (error) {
        newErrors.questionario_json = 'JSON inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingQuestionnaire) {
        await apiService.updateQuestionnaire(editingQuestionnaire.id, formData);
      } else {
        await apiService.createQuestionnaire(formData);
      }
      
      setShowModal(false);
      setEditingQuestionnaire(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar questionário:', error);
    }
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    setEditingQuestionnaire(questionnaire);
    try {
      const fields = JSON.parse(questionnaire.questionario_json);
      setCurrentFields(fields);
      setFormData({
        nome: questionnaire.nome,
        questionario_json: questionnaire.questionario_json
      });
      setEditMode('visual');
    } catch (error) {
      // Se o JSON for inválido, usa o modo JSON
      setCurrentFields([]);
      setEditMode('json');
    }
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este questionário?')) {
      try {
        await apiService.deleteQuestionnaire(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir questionário:', error);
      }
    }
  };

  const handlePreview = (questionnaire: Questionnaire) => {
    try {
      const fields = JSON.parse(questionnaire.questionario_json);
      setPreviewFields(fields);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Erro ao fazer preview:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      questionario_json: ''
    });
    setCurrentFields([]);
    setErrors({});
  };

  const handleFieldsChange = (fields: QuestionField[]) => {
    setCurrentFields(fields);
    setFormData(prev => ({
      ...prev,
      questionario_json: JSON.stringify(fields, null, 2)
    }));
  };

  const handleJsonChange = (jsonString: string) => {
    setFormData(prev => ({
      ...prev,
      questionario_json: jsonString
    }));
    
    try {
      const fields = JSON.parse(jsonString);
      setCurrentFields(fields);
    } catch (error) {
      // JSON inválido, não atualiza os campos visuais
    }
  };

  const openNewModal = () => {
    setEditingQuestionnaire(null);
    setCurrentFields(defaultFields);
    setFormData({
      nome: '',
      questionario_json: JSON.stringify(defaultFields, null, 2)
    });
    setEditMode('visual');
    setShowModal(true);
  };

  const filteredQuestionnaires = (questionnaires || []).filter(q =>
    q.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Questionários</h1>
        <button
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Novo Questionário
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar questionários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de questionários */}
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
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestionnaires.map((questionnaire) => {
                let fieldCount = 0;
                try {
                  const fields = JSON.parse(questionnaire.questionario_json);
                  fieldCount = Array.isArray(fields) ? fields.length : 0;
                } catch (error) {
                  fieldCount = 0;
                }

                return (
                  <tr key={questionnaire.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {questionnaire.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fieldCount} campo{fieldCount !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handlePreview(questionnaire)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Visualizar"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(questionnaire)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(questionnaire.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredQuestionnaires.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum questionário encontrado.
            </div>
          )}
        </div>
      )}

      {/* Modal de criação/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingQuestionnaire ? 'Editar Questionário' : 'Novo Questionário'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingQuestionnaire(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Questionário *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nome ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite o nome do questionário"
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
              </div>

              {/* Abas de edição */}
              <div>
                <div className="border-b border-gray-200 mb-4">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      type="button"
                      onClick={() => setEditMode('visual')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        editMode === 'visual'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Palette size={16} />
                        Editor Visual
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode('json')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        editMode === 'json'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Code size={16} />
                        Editor JSON
                      </div>
                    </button>
                  </nav>
                </div>

                {/* Conteúdo das abas */}
                {editMode === 'visual' ? (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[600px]">
                    <FormBuilder
                      fields={currentFields}
                      onChange={handleFieldsChange}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estrutura JSON do Questionário *
                    </label>
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Defina os campos do formulário usando JSON. Exemplo de estrutura:
                      </p>
                      <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-700">
                        {JSON.stringify(defaultFields, null, 2)}
                      </div>
                    </div>
                    <textarea
                      value={formData.questionario_json}
                      onChange={(e) => handleJsonChange(e.target.value)}
                      rows={15}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                        errors.questionario_json ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Cole aqui o JSON do questionário"
                    />
                    {errors.questionario_json && <p className="text-red-500 text-sm mt-1">{errors.questionario_json}</p>}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingQuestionnaire(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingQuestionnaire ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Preview do Questionário</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <DynamicForm
              fields={previewFields}
              onSubmit={() => {}} // Não faz nada no preview
              readOnly={true}
              submitLabel=""
              cancelLabel="Fechar"
              onCancel={() => setShowPreviewModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaires;
