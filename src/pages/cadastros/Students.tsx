import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    User,
    DownloadCloud
} from 'lucide-react';
import { apiService } from '../../services/api';
import type { Student, Company, Function } from '../../types';
import DataTable, { type Column, type ActionButton } from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import Modal from '../../components/Modal';
import { StudentForm, type StudentFormData } from '../../components/forms';

const Students: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [functions, setFunctions] = useState<Function[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [selectedFunction, setSelectedFunction] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<StudentFormData>({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        cep: '',
        cidade: '',
        estado: '',
        bairro: '',
        pais: 'Brasil',
        numero_endereco: '',
        complemento: '',
        codigo: '',
        responsavel: '',
        observacao: '',
        empresa_id: '',
        funcao_id: '',
        data_admissao: '',
        contato_rh: '',
        data_desligamento: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [studentsRes, companiesRes, functionsRes] = await Promise.all([
                apiService.getStudents(),
                apiService.getCompanies(),
                apiService.getFunctions()
            ]);

            setStudents(studentsRes.data || []);
            setCompanies(companiesRes.data || []);
            setFunctions(functionsRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStudent) {
                await apiService.updateStudent(editingStudent.id, formData);
            } else {
                await apiService.createStudent(formData);
            }
            setShowModal(false);
            setEditingStudent(null);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Erro ao salvar aluno:', error);
        }
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            nome: student.nome,
            email: student.email,
            telefone: student.telefone,
            cpf: student.cpf,
            cep: student.cep || '',
            cidade: student.cidade,
            estado: student.estado,
            bairro: student.bairro,
            pais: student.pais,
            numero_endereco: student.numero_endereco,
            complemento: student.complemento || '',
            codigo: student.codigo,
            responsavel: student.responsavel,
            observacao: student.observacao || '',
            empresa_id: student.empresa_id?.toString() || '',
            funcao_id: student.funcao_id?.toString() || '',
            data_admissao: student.data_admissao || '',
            contato_rh: student.contato_rh || '',
            data_desligamento: student.data_desligamento || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
            try {
                await apiService.deleteStudent(id);
                loadData();
            } catch (error) {
                console.error('Erro ao excluir aluno:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            email: '',
            telefone: '',
            cpf: '',
            cep: '',
            cidade: '',
            estado: '',
            bairro: '',
            pais: 'Brasil',
            numero_endereco: '',
            complemento: '',
            codigo: '',
            responsavel: '',
            observacao: '',
            empresa_id: '',
            funcao_id: '',
            data_admissao: '',
            contato_rh: '',
            data_desligamento: ''
        });
    };

    const openNewModal = () => {
        setEditingStudent(null);
        resetForm();
        setShowModal(true);
    };


    const filteredStudents = students.filter(student => {
        const matchesSearch = student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.codigo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCompany = !selectedCompany || student.empresa_id?.toString() === selectedCompany;
        const matchesFunction = !selectedFunction || student.funcao_id?.toString() === selectedFunction;

        return matchesSearch && matchesCompany && matchesFunction;
    });

    const getCompanyName = (companyId?: number) => {
        return companies.find(c => c.id === companyId)?.razao_social || 'N/A';
    };

    const getFunctionName = (functionId?: number) => {
        return functions.find(f => f.id === functionId)?.nome_funcao || 'N/A';
    };

    // Definição das colunas da tabela
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
                        <div className="text-sm font-medium text-gray-900">{student.nome}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'codigo',
            label: 'Código'
        },
        {
            key: 'empresa',
            label: 'Empresa',
            render: (student) => getCompanyName(student.empresa_id)
        },
        {
            key: 'funcao',
            label: 'Função',
            render: (student) => getFunctionName(student.funcao_id)
        },
        {
            key: 'status',
            label: 'Status',
            render: (student) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.data_desligamento
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                    {student.data_desligamento ? 'Desligado' : 'Ativo'}
                </span>
            )
        }
    ];

    // Definição das ações da tabela
    const studentActions: ActionButton<Student>[] = [
        {
            icon: <Edit className="w-4 h-4" />,
            onClick: handleEdit,
            className: "text-blue-600 hover:text-blue-900",
            title: "Editar"
        },
        {
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (student) => handleDelete(student.id),
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
                searchPlaceholder="Buscar por nome, email ou código..."
                filters={[
                    {
                        label: "Todas as empresas",
                        value: selectedCompany,
                        options: companies.map(company => ({
                            value: company.id.toString(),
                            label: company.razao_social
                        })),
                        onChange: setSelectedCompany
                    },
                    {
                        label: "Todas as funções",
                        value: selectedFunction,
                        options: functions.map(func => ({
                            value: func.id.toString(),
                            label: func.nome_funcao
                        })),
                        onChange: setSelectedFunction
                    }
                ]}
                actions={
                    <>
                        <button
                            onClick={openNewModal}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Aluno
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

            {/* Students List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Lista de Alunos ({filteredStudents.length})
                    </h3>
                </div>
                
                <DataTable
                    data={filteredStudents}
                    columns={studentColumns}
                    actions={studentActions}
                    emptyState={{
                        icon: <User className="mx-auto h-12 w-12 text-gray-400" />,
                        title: "Nenhum aluno encontrado",
                        description: searchTerm || selectedCompany || selectedFunction
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Comece criando um novo aluno.'
                    }}
                />
            </div>

            {/* Modal de Cadastro/Edição */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
                size="xl"
            >
                <StudentForm
                    formData={formData}
                    onFormDataChange={setFormData}
                    companies={companies}
                    functions={functions}
                    editingStudent={editingStudent}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>
        </div>
    );
};

export default Students; 