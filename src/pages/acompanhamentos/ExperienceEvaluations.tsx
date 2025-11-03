import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    User,
    Calendar,
    Star,
    DownloadCloud,
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { apiService } from '../../services/api';
import type { ExperienceEvaluation, Student } from '../../types';
import DataTable, { type Column, type ActionButton } from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import Modal from '../../components/Modal';

interface ExperienceEvaluationFormData {
    aluno_id: string;
    ingresso: string;
    avaliacoes: string;
    resultado_final: string;
}

const ExperienceEvaluations: React.FC = () => {
    const [evaluations, setEvaluations] = useState<ExperienceEvaluation[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedResult, setSelectedResult] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingEvaluation, setEditingEvaluation] = useState<ExperienceEvaluation | null>(null);
    const [formData, setFormData] = useState<ExperienceEvaluationFormData>({
        aluno_id: '',
        ingresso: '',
        avaliacoes: '',
        resultado_final: ''
    });

    const [errors, setErrors] = useState<{[key: string]: string}>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [evaluationsRes, studentsRes] = await Promise.all([
                apiService.getExperienceEvaluations(),
                apiService.getStudents()
            ]);

            setEvaluations(evaluationsRes.data || []);
            setStudents(studentsRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.aluno_id) {
            newErrors.aluno_id = 'Aluno é obrigatório';
        }

        if (!formData.ingresso) {
            newErrors.ingresso = 'Data de ingresso é obrigatória';
        }

        if (!formData.avaliacoes.trim()) {
            newErrors.avaliacoes = 'Avaliações são obrigatórias';
        }

        if (!formData.resultado_final) {
            newErrors.resultado_final = 'Resultado final é obrigatório';
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
                aluno_id: parseInt(formData.aluno_id)
            };

            if (editingEvaluation) {
                await apiService.updateExperienceEvaluation(editingEvaluation.id, dataToSend);
            } else {
                await apiService.createExperienceEvaluation(dataToSend);
            }

            setShowModal(false);
            setEditingEvaluation(null);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Erro ao salvar avaliação:', error);
        }
    };

    const handleEdit = (evaluation: ExperienceEvaluation) => {
        setEditingEvaluation(evaluation);
        setFormData({
            aluno_id: evaluation.aluno_id.toString(),
            ingresso: evaluation.ingresso,
            avaliacoes: evaluation.avaliacoes,
            resultado_final: evaluation.resultado_final
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
            try {
                await apiService.deleteExperienceEvaluation(id);
                loadData();
            } catch (error) {
                console.error('Erro ao excluir avaliação:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            aluno_id: '',
            ingresso: '',
            avaliacoes: '',
            resultado_final: ''
        });
        setErrors({});
    };

    const openNewModal = () => {
        setEditingEvaluation(null);
        resetForm();
        setShowModal(true);
    };

    const filteredEvaluations = evaluations.filter(evaluation => {
        const student = students.find(s => s.id === evaluation.aluno_id);
        const matchesSearch = !searchTerm || 
            student?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            evaluation.avaliacoes.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesResult = !selectedResult || evaluation.resultado_final === selectedResult;

        return matchesSearch && matchesResult;
    });

    const getStudentName = (studentId: number) => {
        return students.find(s => s.id === studentId)?.nome || 'N/A';
    };

    const getStudentEmail = (studentId: number) => {
        return students.find(s => s.id === studentId)?.email || 'N/A';
    };

    const getResultIcon = (result: string) => {
        switch (result) {
            case 'Aprovado':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'Reprovado':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'Em Andamento':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case 'Aprovado':
                return 'text-green-600 bg-green-50';
            case 'Reprovado':
                return 'text-red-600 bg-red-50';
            case 'Em Andamento':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    // Definição das colunas da tabela
    const evaluationColumns: Column<ExperienceEvaluation>[] = [
        {
            key: 'aluno',
            label: 'Aluno',
            render: (evaluation) => (
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {getStudentName(evaluation.aluno_id)}
                        </div>
                        <div className="text-sm text-gray-500">
                            {getStudentEmail(evaluation.aluno_id)}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'ingresso',
            label: 'Data de Ingresso',
            render: (evaluation) => (
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{new Date(evaluation.ingresso).toLocaleDateString('pt-BR')}</span>
                </div>
            )
        },
        {
            key: 'resultado_final',
            label: 'Resultado',
            render: (evaluation) => (
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(evaluation.resultado_final)}`}>
                    {getResultIcon(evaluation.resultado_final)}
                    <span className="ml-1">{evaluation.resultado_final}</span>
                </div>
            )
        },
        {
            key: 'avaliacoes',
            label: 'Avaliações',
            render: (evaluation) => (
                <div className="max-w-xs truncate" title={evaluation.avaliacoes}>
                    {evaluation.avaliacoes}
                </div>
            )
        }
    ];

    // Definição das ações da tabela
    const evaluationActions: ActionButton<ExperienceEvaluation>[] = [
        {
            icon: <Eye className="w-4 h-4" />,
            onClick: (evaluation) => {
                // Implementar visualização detalhada
                console.log('Visualizar avaliação:', evaluation);
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
            onClick: (evaluation) => handleDelete(evaluation.id),
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
                <h1 className="text-2xl font-bold text-gray-900">Avaliação do Período de Experiência</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Gerencie as avaliações dos períodos de experiência dos alunos
                </p>
            </div>

            {/* Actions and Filters */}
            <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Buscar por nome, email ou avaliações..."
                filters={[
                    {
                        label: "Todos os resultados",
                        value: selectedResult,
                        options: [
                            { value: '', label: 'Todos' },
                            { value: 'Aprovado', label: 'Aprovado' },
                            { value: 'Reprovado', label: 'Reprovado' },
                            { value: 'Em Andamento', label: 'Em Andamento' }
                        ],
                        onChange: setSelectedResult
                    }
                ]}
                actions={
                    <>
                        <button
                            onClick={openNewModal}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Avaliação
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

            {/* Evaluations List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Lista de Avaliações ({filteredEvaluations.length})
                    </h3>
                </div>

                <DataTable
                    data={filteredEvaluations}
                    columns={evaluationColumns}
                    actions={evaluationActions}
                    emptyState={{
                        icon: <Star className="mx-auto h-12 w-12 text-gray-400" />,
                        title: "Nenhuma avaliação encontrada",
                        description: searchTerm || selectedResult
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Comece criando uma nova avaliação.'
                    }}
                />
            </div>

            {/* Modal de Cadastro/Edição */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingEvaluation ? 'Editar Avaliação' : 'Nova Avaliação'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Aluno *
                        </label>
                        <select
                            value={formData.aluno_id}
                            onChange={(e) => setFormData({...formData, aluno_id: e.target.value})}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.aluno_id ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Selecione um aluno...</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.nome} - {student.email}
                                </option>
                            ))}
                        </select>
                        {errors.aluno_id && <p className="text-red-500 text-sm mt-1">{errors.aluno_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data de Ingresso *
                        </label>
                        <input
                            type="date"
                            value={formData.ingresso}
                            onChange={(e) => setFormData({...formData, ingresso: e.target.value})}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.ingresso ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.ingresso && <p className="text-red-500 text-sm mt-1">{errors.ingresso}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resultado Final *
                        </label>
                        <select
                            value={formData.resultado_final}
                            onChange={(e) => setFormData({...formData, resultado_final: e.target.value})}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.resultado_final ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Selecione o resultado...</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Reprovado">Reprovado</option>
                            <option value="Em Andamento">Em Andamento</option>
                        </select>
                        {errors.resultado_final && <p className="text-red-500 text-sm mt-1">{errors.resultado_final}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Avaliações *
                        </label>
                        <textarea
                            value={formData.avaliacoes}
                            onChange={(e) => setFormData({...formData, avaliacoes: e.target.value})}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.avaliacoes ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Descreva as avaliações realizadas..."
                        />
                        {errors.avaliacoes && <p className="text-red-500 text-sm mt-1">{errors.avaliacoes}</p>}
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
                            {editingEvaluation ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ExperienceEvaluations;
