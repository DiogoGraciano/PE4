import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Building,
    Calendar,
    User,
    DownloadCloud,
    Eye,
    MapPin,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import type { JobMarketFollowUp, Company } from '../../types';
import DataTable, { type Column, type ActionButton } from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import Modal from '../../components/Modal';

interface JobMarketFollowUpFormData {
    nome: string;
    data_admissao: string;
    empresa_id: string;
    responsavel_rh: string;
    data_visita: string;
    contato_com: string;
    parecer_geral: string;
}

const JobMarketFollowUps: React.FC = () => {
    const [followUps, setFollowUps] = useState<JobMarketFollowUp[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingFollowUp, setEditingFollowUp] = useState<JobMarketFollowUp | null>(null);
    const [formData, setFormData] = useState<JobMarketFollowUpFormData>({
        nome: '',
        data_admissao: '',
        empresa_id: '',
        responsavel_rh: '',
        data_visita: '',
        contato_com: '',
        parecer_geral: ''
    });

    const [errors, setErrors] = useState<{[key: string]: string}>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [followUpsRes, companiesRes] = await Promise.all([
                apiService.getJobMarketFollowUps(),
                apiService.getCompanies()
            ]);

            setFollowUps(followUpsRes.data || []);
            setCompanies(companiesRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        }

        if (!formData.data_admissao) {
            newErrors.data_admissao = 'Data de admissão é obrigatória';
        }

        if (!formData.empresa_id) {
            newErrors.empresa_id = 'Empresa é obrigatória';
        }

        if (!formData.responsavel_rh.trim()) {
            newErrors.responsavel_rh = 'Responsável RH é obrigatório';
        }

        if (!formData.data_visita) {
            newErrors.data_visita = 'Data da visita é obrigatória';
        }

        if (!formData.contato_com.trim()) {
            newErrors.contato_com = 'Contato com é obrigatório';
        }

        if (!formData.parecer_geral.trim()) {
            newErrors.parecer_geral = 'Parecer geral é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const dataToSend = {
                ...formData,
                empresa_id: parseInt(formData.empresa_id)
            };

            if (editingFollowUp) {
                await apiService.updateJobMarketFollowUp(editingFollowUp.id, dataToSend);
            } else {
                await apiService.createJobMarketFollowUp(dataToSend);
            }

            setShowModal(false);
            setEditingFollowUp(null);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Erro ao salvar acompanhamento:', error);
        }
    };

    const handleEdit = (followUp: JobMarketFollowUp) => {
        setEditingFollowUp(followUp);
        setFormData({
            nome: followUp.nome,
            data_admissao: followUp.data_admissao,
            empresa_id: followUp.empresa_id.toString(),
            responsavel_rh: followUp.responsavel_rh,
            data_visita: followUp.data_visita,
            contato_com: followUp.contato_com,
            parecer_geral: followUp.parecer_geral
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este acompanhamento?')) {
            try {
                await apiService.deleteJobMarketFollowUp(id);
                loadData();
            } catch (error) {
                console.error('Erro ao excluir acompanhamento:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            data_admissao: '',
            empresa_id: '',
            responsavel_rh: '',
            data_visita: '',
            contato_com: '',
            parecer_geral: ''
        });
        setErrors({});
    };

    const openNewModal = () => {
        setEditingFollowUp(null);
        resetForm();
        setShowModal(true);
    };

    const filteredFollowUps = followUps.filter(followUp => {
        const company = companies.find(c => c.id === followUp.empresa_id);
        const matchesSearch = !searchTerm || 
            followUp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company?.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
            followUp.responsavel_rh.toLowerCase().includes(searchTerm.toLowerCase()) ||
            followUp.contato_com.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCompany = !selectedCompany || followUp.empresa_id.toString() === selectedCompany;

        return matchesSearch && matchesCompany;
    });

    const getCompanyName = (companyId: number) => {
        return companies.find(c => c.id === companyId)?.razao_social || 'N/A';
    };

    const getCompanyLocation = (companyId: number) => {
        const company = companies.find(c => c.id === companyId);
        return company ? `${company.cidade}, ${company.estado}` : 'N/A';
    };

    const getStatusIcon = (dataVisita: string) => {
        const visitDate = new Date(dataVisita);
        const today = new Date();
        const diffTime = visitDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return <CheckCircle className="w-5 h-5 text-green-600" />;
        } else if (diffDays <= 7) {
            return <Clock className="w-5 h-5 text-yellow-600" />;
        } else {
            return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusText = (dataVisita: string) => {
        const visitDate = new Date(dataVisita);
        const today = new Date();
        const diffTime = visitDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return 'Realizada';
        } else if (diffDays <= 7) {
            return 'Próxima';
        } else {
            return 'Agendada';
        }
    };

    const getStatusColor = (dataVisita: string) => {
        const visitDate = new Date(dataVisita);
        const today = new Date();
        const diffTime = visitDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return 'text-green-600 bg-green-50';
        } else if (diffDays <= 7) {
            return 'text-yellow-600 bg-yellow-50';
        } else {
            return 'text-gray-600 bg-gray-50';
        }
    };

    // Definição das colunas da tabela
    const followUpColumns: Column<JobMarketFollowUp>[] = [
        {
            key: 'nome',
            label: 'Nome',
            render: (followUp) => (
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{followUp.nome}</div>
                        <div className="text-sm text-gray-500">{followUp.contato_com}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'empresa',
            label: 'Empresa',
            render: (followUp) => (
                <div className="flex items-center">
                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {getCompanyName(followUp.empresa_id)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {getCompanyLocation(followUp.empresa_id)}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'responsavel_rh',
            label: 'Responsável RH',
            render: (followUp) => (
                <div className="text-sm text-gray-900">{followUp.responsavel_rh}</div>
            )
        },
        {
            key: 'data_visita',
            label: 'Data da Visita',
            render: (followUp) => (
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                        <div className="text-sm text-gray-900">
                            {new Date(followUp.data_visita).toLocaleDateString('pt-BR')}
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(followUp.data_visita)}`}>
                            {getStatusIcon(followUp.data_visita)}
                            <span className="ml-1">{getStatusText(followUp.data_visita)}</span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    // Definição das ações da tabela
    const followUpActions: ActionButton<JobMarketFollowUp>[] = [
        {
            icon: <Eye className="w-4 h-4" />,
            onClick: (followUp) => {
                // Implementar visualização detalhada
                console.log('Visualizar acompanhamento:', followUp);
            },
            className: "text-blue-600 hover:text-blue-900",
            title: "Visualizar"
        },
        {
            icon: <Edit className="w-4 h-4" />,
            onClick: handleEdit,
            className: "text-indigo-600 hover:text-indigo-900",
            title: "Editar"
        },
        {
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (followUp) => handleDelete(followUp.id),
            className: "text-red-600 hover:text-red-900",
            title: "Excluir"
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Acompanhamento do Mercado de Trabalho</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Gerencie o acompanhamento dos alunos no mercado de trabalho
                </p>
            </div>

            {/* Actions and Filters */}
            <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Buscar por nome, empresa ou responsável..."
                filters={[
                    {
                        label: "Todas as empresas",
                        value: selectedCompany,
                        options: companies.map(company => ({
                            value: company.id.toString(),
                            label: company.razao_social
                        })),
                        onChange: setSelectedCompany
                    }
                ]}
                actions={
                    <>
                        <button
                            onClick={openNewModal}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Acompanhamento
                        </button>
                        
                        <button
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <DownloadCloud className="w-4 h-4 mr-2" />
                            Gerar Relatório
                        </button>
                    </>
                }
            />

            {/* Follow-ups List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Lista de Acompanhamentos ({filteredFollowUps.length})
                    </h3>
                </div>

                <DataTable
                    data={filteredFollowUps}
                    columns={followUpColumns}
                    actions={followUpActions}
                    emptyState={{
                        icon: <Building className="mx-auto h-12 w-12 text-gray-400" />,
                        title: "Nenhum acompanhamento encontrado",
                        description: searchTerm || selectedCompany
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Comece criando um novo acompanhamento.'
                    }}
                />
            </div>

            {/* Modal de Cadastro/Edição */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingFollowUp ? 'Editar Acompanhamento' : 'Novo Acompanhamento'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome *
                            </label>
                            <input
                                type="text"
                                value={formData.nome}
                                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.nome ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Nome do acompanhamento"
                            />
                            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Empresa *
                            </label>
                            <select
                                value={formData.empresa_id}
                                onChange={(e) => setFormData({...formData, empresa_id: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.empresa_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Selecione uma empresa...</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.razao_social}
                                    </option>
                                ))}
                            </select>
                            {errors.empresa_id && <p className="text-red-500 text-sm mt-1">{errors.empresa_id}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data de Admissão *
                            </label>
                            <input
                                type="date"
                                value={formData.data_admissao}
                                onChange={(e) => setFormData({...formData, data_admissao: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.data_admissao ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.data_admissao && <p className="text-red-500 text-sm mt-1">{errors.data_admissao}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data da Visita *
                            </label>
                            <input
                                type="date"
                                value={formData.data_visita}
                                onChange={(e) => setFormData({...formData, data_visita: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.data_visita ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.data_visita && <p className="text-red-500 text-sm mt-1">{errors.data_visita}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Responsável RH *
                            </label>
                            <input
                                type="text"
                                value={formData.responsavel_rh}
                                onChange={(e) => setFormData({...formData, responsavel_rh: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.responsavel_rh ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Nome do responsável RH"
                            />
                            {errors.responsavel_rh && <p className="text-red-500 text-sm mt-1">{errors.responsavel_rh}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contato com *
                            </label>
                            <input
                                type="text"
                                value={formData.contato_com}
                                onChange={(e) => setFormData({...formData, contato_com: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.contato_com ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Com quem foi o contato"
                            />
                            {errors.contato_com && <p className="text-red-500 text-sm mt-1">{errors.contato_com}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Parecer Geral *
                        </label>
                        <textarea
                            value={formData.parecer_geral}
                            onChange={(e) => setFormData({...formData, parecer_geral: e.target.value})}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.parecer_geral ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Descreva o parecer geral do acompanhamento..."
                        />
                        {errors.parecer_geral && <p className="text-red-500 text-sm mt-1">{errors.parecer_geral}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {editingFollowUp ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default JobMarketFollowUps;
