import React, { useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    User,
    DownloadCloud,
    FileText,
    Building2,
    Briefcase,
    CalendarPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import type { Student, Referral } from '../../types';
import DataTable, { type Column, type ActionButton } from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import Modal from '../../components/Modal';
import CompanySelectModal from '../../components/CompanySelectModal';
import { StudentForm, type StudentFormData } from '../../components/forms';
import { TextInput, FormActions } from '../../components/inputs';
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '../../hooks/useStudents';
import { useCompanies } from '../../hooks/useCompanies';
import { useReferrals, useCreateReferral, useUpdateReferral, useDeleteReferral } from '../../hooks/useReferrals';

// ---- Formulario de dados do encaminhamento ----
interface ReferralFormData {
    empresa_id: string;
    funcao: string;
    data_admissao: string;
    contato_rh: string;
    data_desligamento: string;
    observacao: string;
}

const emptyReferralForm: ReferralFormData = {
    empresa_id: '',
    funcao: '',
    data_admissao: '',
    contato_rh: '',
    data_desligamento: '',
    observacao: '',
};

const Students: React.FC = () => {
    const navigate = useNavigate();
    const { data: students = [], isLoading: loading } = useStudents();
    const { data: companies = [] } = useCompanies();
    const createStudent = useCreateStudent();
    const updateStudent = useUpdateStudent();
    const deleteStudent = useDeleteStudent();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    // ---- Encaminhamentos ----
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
    const [referralForm, setReferralForm] = useState<ReferralFormData>(emptyReferralForm);
    const [showCompanyModal, setShowCompanyModal] = useState(false);

    const { data: referrals = [], isLoading: referralsLoading } = useReferrals(selectedStudent?.id);
    const createReferral = useCreateReferral();
    const updateReferral = useUpdateReferral();
    const deleteReferral = useDeleteReferral();

    const emptyStudentForm: StudentFormData = {
        nome: '', email: '', telefone: '', cpf: '', cep: '',
        cidade: '', estado: '', bairro: '', pais: 'Brasil',
        numero_endereco: '', complemento: '', codigo: '',
        responsavel: '', observacao: '',
    };

    const [formData, setFormData] = useState<StudentFormData>(emptyStudentForm);

    // ---- Aluno CRUD ----
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const studentData: any = { codigo: formData.codigo, responsavel: formData.responsavel };
            const optional: (keyof StudentFormData)[] = [
                'nome','email','telefone','cpf','cep','cidade','estado',
                'bairro','pais','numero_endereco','complemento','observacao',
            ];
            for (const key of optional) {
                if (formData[key]?.trim()) studentData[key] = formData[key];
            }

            if (editingStudent?.id) {
                await updateStudent.mutateAsync({ id: editingStudent.id, data: studentData });
            } else {
                await createStudent.mutateAsync(studentData);
            }
            setShowModal(false);
            setEditingStudent(null);
            setFormData(emptyStudentForm);
        } catch (error) {
            console.error('Erro ao salvar aluno:', error);
        }
    };

    const handleEdit = async (student: Student) => {
        if (!student.id) return;
        try {
            const res = await apiService.getStudent(student.id);
            const s = res.data || student;
            setEditingStudent(s);
            setFormData({
                nome: s.nome || '', email: s.email || '', telefone: s.telefone || '',
                cpf: s.cpf || '', cep: s.cep || '', cidade: s.cidade || '',
                estado: s.estado || '', bairro: s.bairro || '', pais: s.pais || 'Brasil',
                numero_endereco: s.numero_endereco || '', complemento: s.complemento || '',
                codigo: s.codigo || '', responsavel: s.responsavel || '',
                observacao: s.observacao || '',
            });
            setShowModal(true);
        } catch {
            console.error('Erro ao carregar dados do aluno');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
            try {
                await deleteStudent.mutateAsync(id);
                if (selectedStudent?.id === id) setSelectedStudent(null);
            } catch (error) {
                console.error('Erro ao excluir aluno:', error);
            }
        }
    };

    // ---- Encaminhamento CRUD ----
    const formatDate = (d: string | Date | null | undefined) => {
        if (!d) return '';
        return typeof d === 'string' ? d.split('T')[0] : '';
    };

    const openNewReferral = () => {
        setEditingReferral(null);
        setReferralForm(emptyReferralForm);
        setShowReferralModal(true);
    };

    const openEditReferral = (r: Referral) => {
        setEditingReferral(r);
        setReferralForm({
            empresa_id: r.empresa_id.toString(),
            funcao: r.funcao || '',
            data_admissao: formatDate(r.data_admissao),
            contato_rh: r.contato_rh || '',
            data_desligamento: formatDate(r.data_desligamento),
            observacao: r.observacao || '',
        });
        setShowReferralModal(true);
    };

    const handleReferralSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent?.id || !referralForm.empresa_id) return;
        try {
            const data: any = {
                aluno_id: selectedStudent.id,
                empresa_id: parseInt(referralForm.empresa_id),
                funcao: referralForm.funcao.trim() || null,
                data_admissao: referralForm.data_admissao || null,
                contato_rh: referralForm.contato_rh.trim() || null,
                data_desligamento: referralForm.data_desligamento || null,
                observacao: referralForm.observacao.trim() || null,
            };

            if (editingReferral) {
                await updateReferral.mutateAsync({ id: editingReferral.id, data });
            } else {
                await createReferral.mutateAsync(data);
            }
            setShowReferralModal(false);
            setEditingReferral(null);
            setReferralForm(emptyReferralForm);
        } catch (error) {
            console.error('Erro ao salvar encaminhamento:', error);
        }
    };

    const handleDeleteReferral = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este encaminhamento?')) {
            try {
                await deleteReferral.mutateAsync(id);
            } catch (error) {
                console.error('Erro ao excluir encaminhamento:', error);
            }
        }
    };

    const selectedCompanyForReferral = companies.find(
        c => c.id.toString() === referralForm.empresa_id
    );

    // ---- Tabela de alunos ----
    const filteredStudents = students.filter((student: Student) => {
        const term = searchTerm.toLowerCase();
        return (
            (student.nome && student.nome.toLowerCase().includes(term)) ||
            (student.email && student.email.toLowerCase().includes(term)) ||
            student.codigo.toLowerCase().includes(term) ||
            student.responsavel.toLowerCase().includes(term) ||
            (student.observacao && student.observacao.toLowerCase().includes(term))
        );
    });

    const formatPhone = (phone?: string) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        return phone;
    };

    const formatCPF = (cpf?: string) => {
        if (!cpf) return '';
        const digits = cpf.replace(/\D/g, '');
        if (digits.length === 11) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        return cpf;
    };

    const studentColumns: Column<Student>[] = [
        {
            key: 'aluno',
            label: 'Aluno',
            render: (student) => (
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.nome || student.codigo}</div>
                        <div className="text-sm text-gray-500">{student.email || '—'}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'codigo',
            label: 'Código',
            render: (student) => (
                <span className="text-sm text-gray-900">{student.codigo || '—'}</span>
            )
        },
        {
            key: 'cpf',
            label: 'CPF',
            render: (student) => (
                <span className="text-sm text-gray-600">{formatCPF(student.cpf) || '—'}</span>
            )
        },
        {
            key: 'telefone',
            label: 'Telefone',
            render: (student) => (
                <span className="text-sm text-gray-600">{formatPhone(student.telefone) || '—'}</span>
            )
        },
        {
            key: 'responsavel',
            label: 'Responsável',
            render: (student) => (
                <span className="text-sm text-gray-600">{student.responsavel || '—'}</span>
            )
        },
        {
            key: 'localizacao',
            label: 'Cidade/UF',
            render: (student) => {
                const partes = [student.cidade, student.estado].filter(Boolean);
                return (
                    <span className="text-sm text-gray-600">
                        {partes.length > 0 ? partes.join(' / ') : '—'}
                    </span>
                );
            }
        },
    ];

    const studentActions: ActionButton<Student>[] = [
        {
            icon: <CalendarPlus className="w-4 h-4" />,
            onClick: (student) => {
                if (!student.id) return;
                navigate('/agenda', {
                    state: {
                        newEvent: {
                            tipo: 'visita_aluno',
                            aluno_id: student.id,
                            titulo: `Visita — ${student.nome || student.codigo}`,
                        },
                    },
                });
            },
            className: "text-orange-600 hover:text-orange-900",
            title: "Agendar Visita"
        },
        {
            icon: <Briefcase className="w-4 h-4" />,
            onClick: (student) => setSelectedStudent(student),
            className: "text-purple-600 hover:text-purple-900",
            title: "Encaminhamentos"
        },
        {
            icon: <FileText className="w-4 h-4" />,
            onClick: (student) => { if (student.id) navigate(`/alunos/${student.id}/respostas`); },
            className: "text-green-600 hover:text-green-900",
            title: "Ver Respostas"
        },
        {
            icon: <Edit className="w-4 h-4" />,
            onClick: handleEdit,
            className: "text-blue-600 hover:text-blue-900",
            title: "Editar"
        },
        {
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (student) => { if (student.id) handleDelete(student.id); },
            className: "text-red-600 hover:text-red-900",
            title: "Excluir"
        }
    ];

    // ---- Tabela de encaminhamentos ----
    const referralColumns: Column<Referral>[] = [
        {
            key: 'empresa',
            label: 'Empresa',
            render: (r) => (
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{r.empresa?.razao_social || '—'}</span>
                </div>
            )
        },
        { key: 'funcao', label: 'Função', render: (r) => r.funcao || '—' },
        {
            key: 'data_admissao',
            label: 'Admissão',
            render: (r) => r.data_admissao ? new Date(r.data_admissao).toLocaleDateString('pt-BR') : '—'
        },
        {
            key: 'data_desligamento',
            label: 'Desligamento',
            render: (r) => r.data_desligamento ? new Date(r.data_desligamento).toLocaleDateString('pt-BR') : '—'
        },
        {
            key: 'status',
            label: 'Status',
            render: (r) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    r.data_desligamento ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                    {r.data_desligamento ? 'Encerrado' : 'Ativo'}
                </span>
            )
        },
    ];

    const referralActions: ActionButton<Referral>[] = [
        {
            icon: <Edit className="w-4 h-4" />,
            onClick: openEditReferral,
            className: "text-blue-600 hover:text-blue-900",
            title: "Editar"
        },
        {
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (r) => handleDeleteReferral(r.id),
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
                <h1 className="text-2xl font-bold text-gray-900">Alunos/Usuários</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Gerencie os cadastros de alunos e usuários do sistema
                </p>
            </div>

            {/* Actions and Filters */}
            <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Buscar por nome, email, código, responsável ou observação..."
                actions={
                    <>
                        <button
                            onClick={() => { setEditingStudent(null); setFormData(emptyStudentForm); setShowModal(true); }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Aluno
                        </button>
                        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <DownloadCloud className="w-4 h-4 mr-2" />
                            Gerar Relatório
                        </button>
                    </>
                }
            />

            {/* Students List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Lista de Alunos ({filteredStudents.length})
                    </h3>
                </div>
                <DataTable
                    data={filteredStudents.filter(s => s.id !== undefined) as (Student & { id: number })[]}
                    columns={studentColumns}
                    actions={studentActions}
                    emptyState={{
                        icon: <User className="mx-auto h-12 w-12 text-gray-400" />,
                        title: "Nenhum aluno encontrado",
                        description: searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando um novo aluno.'
                    }}
                />
            </div>

            {/* Modal de Encaminhamentos do aluno */}
            <Modal
                isOpen={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                title={`Encaminhamentos — ${selectedStudent?.nome || selectedStudent?.codigo || ''}`}
                size="2xl"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Histórico de encaminhamentos profissionais do aluno</p>
                        <button
                            onClick={openNewReferral}
                            className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Novo Encaminhamento
                        </button>
                    </div>
                    <DataTable
                        data={referrals as (Referral & { id: number })[]}
                        columns={referralColumns}
                        actions={referralActions}
                        loading={referralsLoading}
                        emptyState={{
                            icon: <Briefcase className="mx-auto h-12 w-12 text-gray-400" />,
                            title: "Nenhum encaminhamento",
                            description: "Este aluno ainda não possui encaminhamentos profissionais."
                        }}
                    />
                </div>
            </Modal>

            {/* Modal de Cadastro/Edição do Aluno */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
                size="xl"
            >
                <StudentForm
                    formData={formData}
                    onFormDataChange={setFormData}
                    editingStudent={editingStudent}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>

            {/* Modal de Encaminhamento */}
            <Modal
                isOpen={showReferralModal}
                onClose={() => setShowReferralModal(false)}
                title={editingReferral ? 'Editar Encaminhamento' : 'Novo Encaminhamento'}
                size="lg"
            >
                <form onSubmit={handleReferralSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Empresa *
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowCompanyModal(true)}
                            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-left hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {selectedCompanyForReferral ? (
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-gray-900">{selectedCompanyForReferral.razao_social}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">Selecione uma empresa</span>
                            )}
                            <span className="text-gray-400 text-xs">Alterar</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextInput
                            label="Função"
                            value={referralForm.funcao}
                            onChange={(v) => setReferralForm({ ...referralForm, funcao: v })}
                            placeholder="Ex: Estagiário, Trainee"
                        />
                        <TextInput
                            label="Contato RH"
                            value={referralForm.contato_rh}
                            onChange={(v) => setReferralForm({ ...referralForm, contato_rh: v })}
                        />
                        <TextInput
                            label="Data de Admissão"
                            type="date"
                            value={referralForm.data_admissao}
                            onChange={(v) => setReferralForm({ ...referralForm, data_admissao: v })}
                        />
                        <TextInput
                            label="Data de Desligamento"
                            type="date"
                            value={referralForm.data_desligamento}
                            onChange={(v) => setReferralForm({ ...referralForm, data_desligamento: v })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Observação</label>
                        <textarea
                            rows={2}
                            value={referralForm.observacao}
                            onChange={(e) => setReferralForm({ ...referralForm, observacao: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <FormActions
                        onCancel={() => setShowReferralModal(false)}
                        onSubmit={() => {}}
                        submitLabel={editingReferral ? 'Atualizar' : 'Cadastrar'}
                    />
                </form>
            </Modal>

            {/* Modal de seleção de empresa (para encaminhamento) */}
            <CompanySelectModal
                isOpen={showCompanyModal}
                onClose={() => setShowCompanyModal(false)}
                companies={companies}
                selectedId={referralForm.empresa_id}
                onSelect={(id) => setReferralForm({ ...referralForm, empresa_id: id })}
            />
        </div>
    );
};

export default Students;
