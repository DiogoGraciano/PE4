import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import apiService from '../../services/api';
import type { Function } from '../../types';
import DataTable, { type Column, type ActionButton } from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import Modal from '../../components/Modal';
import { FunctionForm, type FunctionFormData } from '../../components/forms';

const Functions: React.FC = () => {
  const [functions, setFunctions] = useState<Function[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFunction, setEditingFunction] = useState<Function | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<FunctionFormData>({
    codigo: '',
    nome_funcao: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getFunctions();
      setFunctions(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar funções:', error);
      setFunctions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    }

    if (!formData.nome_funcao.trim()) {
      newErrors.nome_funcao = 'Nome da função é obrigatório';
    }

    // Verificar duplicidade de código
    const existingFunction = (functions || []).find(f => 
      f.codigo.toLowerCase() === formData.codigo.toLowerCase() && 
      f.id !== editingFunction?.id
    );
    if (existingFunction) {
      newErrors.codigo = 'Código já cadastrado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      if (editingFunction) {
        await apiService.updateFunction(editingFunction.id, formData);
      } else {
        await apiService.createFunction(formData);
      }
      
      setShowModal(false);
      setEditingFunction(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar função:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (func: Function) => {
    setEditingFunction(func);
    setFormData({
      codigo: func.codigo,
      nome_funcao: func.nome_funcao,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta função?')) {
      try {
        await apiService.deleteFunction(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir função:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nome_funcao: '',
    });
    setErrors({});
  };

  const openNewModal = () => {
    setEditingFunction(null);
    resetForm();
    setShowModal(true);
  };

  const filteredFunctions = (functions || []).filter(func =>
    func.nome_funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Definição das colunas da tabela
  const functionColumns: Column<Function>[] = [
    {
      key: 'funcao',
      label: 'Função',
      render: () => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'codigo',
      label: 'Código'
    },
    {
      key: 'nome_funcao',
      label: 'Nome da Função'
    }
  ];

  // Definição das ações da tabela
  const functionActions: ActionButton<Function>[] = [
    {
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEdit,
      className: "text-blue-600 hover:text-blue-900",
      title: "Editar"
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (func) => handleDelete(func.id),
      className: "text-red-600 hover:text-red-900",
      title: "Excluir"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Funções/Cargos</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie as funções e cargos disponíveis no sistema
        </p>
      </div>

      {/* Actions and Filters */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por código ou nome da função..."
        actions={
          <button
            onClick={openNewModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Função
          </button>
        }
      />

      {/* Functions List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Funções ({filteredFunctions.length})
          </h3>
        </div>
        
        <DataTable
          data={filteredFunctions}
          columns={functionColumns}
          actions={functionActions}
          emptyState={{
            icon: <Briefcase className="mx-auto h-12 w-12 text-gray-400" />,
            title: "Nenhuma função encontrada",
            description: searchTerm
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando uma nova função.'
          }}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFunction ? 'Editar Função' : 'Nova Função'}
        size="md"
      >
        <FunctionForm
          formData={formData}
          onFormDataChange={setFormData}
          editingFunction={editingFunction}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          isLoading={isLoading}
          errors={errors}
        />
      </Modal>
    </div>
  );
};

export default Functions;
