import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2, MapPin, DownloadCloud } from 'lucide-react';
import apiService from '../../services/api';
import type { Company } from '../../types';
import DataTable, { type Column, type ActionButton } from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import Modal from '../../components/Modal';
import { CompanyForm, type CompanyFormData } from '../../components/forms';

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CompanyFormData>({
    razao_social: '',
    cnpj: '',
    cep: '',
    cidade: '',
    estado: '',
    bairro: '',
    pais: '',
    numero_endereco: '',
    complemento: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCompanies();
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCNPJ = (cnpj: string) => {
    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (cleanCNPJ.length !== 14) {
      return 'CNPJ deve ter 14 dígitos';
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCNPJ)) {
      return 'CNPJ inválido';
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (parseInt(cleanCNPJ.charAt(12)) !== digit) {
      return 'CNPJ inválido';
    }

    // Validação do segundo dígito verificador
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (parseInt(cleanCNPJ.charAt(13)) !== digit) {
      return 'CNPJ inválido';
    }

    return '';
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.razao_social.trim()) {
      newErrors.razao_social = 'Razão social é obrigatória';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else {
      const cnpjError = validateCNPJ(formData.cnpj);
      if (cnpjError) {
        newErrors.cnpj = cnpjError;
      }
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!formData.estado.trim()) {
      newErrors.estado = 'Estado é obrigatório';
    }

    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    if (!formData.pais.trim()) {
      newErrors.pais = 'País é obrigatório';
    }

    if (!formData.numero_endereco.trim()) {
      newErrors.numero_endereco = 'Número do endereço é obrigatório';
    }

    // Verificar duplicidade de CNPJ
    const existingCompany = (companies || []).find(c => 
      c.cnpj.replace(/\D/g, '') === formData.cnpj.replace(/\D/g, '') && 
      c.id !== editingCompany?.id
    );
    if (existingCompany) {
      newErrors.cnpj = 'CNPJ já cadastrado';
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
      
      if (editingCompany) {
        await apiService.updateCompany(editingCompany.id, formData);
      } else {
        await apiService.createCompany(formData);
      }
      
      setShowModal(false);
      setEditingCompany(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      razao_social: company.razao_social,
      cnpj: company.cnpj,
      cep: company.cep || '',
      cidade: company.cidade,
      estado: company.estado,
      bairro: company.bairro,
      pais: company.pais,
      numero_endereco: company.numero_endereco,
      complemento: company.complemento || '',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await apiService.deleteCompany(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir empresa:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      razao_social: '',
      cnpj: '',
      cep: '',
      cidade: '',
      estado: '',
      bairro: '',
      pais: '',
      numero_endereco: '',
      complemento: '',
    });
    setErrors({});
  };

  const openNewModal = () => {
    setEditingCompany(null);
    resetForm();
    setShowModal(true);
  };


  const formatCNPJ = (cnpj: string) => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const filteredCompanies = (companies || []).filter(company => {
    if (!searchTerm.trim()) {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    const searchNumbers = searchTerm.replace(/\D/g, '');
    
    const razaoSocial = (company.razao_social || '').toLowerCase();
    const cnpj = (company.cnpj || '').replace(/\D/g, '');
    
    return razaoSocial.includes(searchLower) || cnpj.includes(searchNumbers);
  });

  // Definição das colunas da tabela
  const companyColumns: Column<Company>[] = [
    {
      key: 'empresa',
      label: 'Empresa',
      render: (company) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {company.razao_social}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'cnpj',
      label: 'CNPJ',
      render: (company) => formatCNPJ(company.cnpj)
    },
    {
      key: 'localizacao',
      label: 'Localização',
      render: (company) => (
        <div>
          <div className="flex items-center text-sm text-gray-900">
            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
            <span>{company.cidade} - {company.estado}</span>
          </div>
          <div className="text-sm text-gray-500">{company.bairro}</div>
        </div>
      )
    },
    {
      key: 'endereco',
      label: 'Endereço',
      render: (company) => (
        <div className="text-sm text-gray-900">
          {company.numero_endereco}
          {company.complemento && (
            <span className="text-gray-500">, {company.complemento}</span>
          )}
        </div>
      )
    }
  ];

  // Definição das ações da tabela
  const companyActions: ActionButton<Company>[] = [
    {
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEdit,
      className: "text-blue-600 hover:text-blue-900",
      title: "Editar"
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (company) => handleDelete(company.id),
      className: "text-red-600 hover:text-red-900",
      title: "Excluir"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie o cadastro de empresas parceiras
        </p>
      </div>

      {/* Actions and Filters */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por razão social ou CNPJ..."
        actions={
          <>
          <button
            onClick={openNewModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Empresa
          </button>

          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
              <DownloadCloud className="w-4 h-4 mr-2" />
              Gerar Relatôrio
          </button>
          </>
        }
      />

      {/* Companies List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Empresas ({filteredCompanies.length})
          </h3>
        </div>

        <DataTable
          data={filteredCompanies}
          columns={companyColumns}
          actions={companyActions}
          emptyState={{
            icon: <Building2 className="mx-auto h-12 w-12 text-gray-400" />,
            title: "Nenhuma empresa encontrada",
            description: searchTerm
                ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando uma nova empresa.'
          }}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
        size="xl"
      >
        <CompanyForm
          formData={formData}
          onFormDataChange={setFormData}
          editingCompany={editingCompany}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          isLoading={isLoading}
          errors={errors}
        />
      </Modal>
    </div>
  );
};

export default Companies;
