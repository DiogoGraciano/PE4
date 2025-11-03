import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    User,
    DownloadCloud,
    FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import type { Student, Company, Function } from '../../types';
import DataTable, { type Column, type ActionButton } from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import Modal from '../../components/Modal';
import { StudentForm, type StudentFormData } from '../../components/forms';

const Students: React.FC = () => {
    const navigate = useNavigate();
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
            // Preparar dados com todos os campos aceitos pelo DTO
            const studentData: any = {
                codigo: formData.codigo,
                responsavel: formData.responsavel,
            };

            // Adicionar campos opcionais apenas se tiverem valor
            if (formData.nome && formData.nome.trim()) {
                studentData.nome = formData.nome;
            }

            if (formData.email && formData.email.trim()) {
                studentData.email = formData.email;
            }

            if (formData.telefone && formData.telefone.trim()) {
                studentData.telefone = formData.telefone;
            }

            if (formData.cpf && formData.cpf.trim()) {
                studentData.cpf = formData.cpf;
            }

            if (formData.cep && formData.cep.trim()) {
                studentData.cep = formData.cep;
            }

            if (formData.cidade && formData.cidade.trim()) {
                studentData.cidade = formData.cidade;
            }

            if (formData.estado && formData.estado.trim()) {
                studentData.estado = formData.estado;
            }

            if (formData.bairro && formData.bairro.trim()) {
                studentData.bairro = formData.bairro;
            }

            if (formData.pais && formData.pais.trim()) {
                studentData.pais = formData.pais;
            }

            if (formData.numero_endereco && formData.numero_endereco.trim()) {
                studentData.numero_endereco = formData.numero_endereco;
            }

            if (formData.complemento && formData.complemento.trim()) {
                studentData.complemento = formData.complemento;
            }

            if (formData.observacao && formData.observacao.trim()) {
                studentData.observacao = formData.observacao;
            }

            if (formData.empresa_id) {
                studentData.empresa_id = parseInt(formData.empresa_id, 10);
            }

            if (formData.funcao_id) {
                studentData.funcao_id = parseInt(formData.funcao_id, 10);
            }

            if (formData.data_admissao) {
                studentData.data_admissao = formData.data_admissao;
            }

            if (formData.contato_rh && formData.contato_rh.trim()) {
                studentData.contato_rh = formData.contato_rh;
            }

            if (formData.data_desligamento) {
                studentData.data_desligamento = formData.data_desligamento;
            }

            if (editingStudent && editingStudent.id) {
                await apiService.updateStudent(editingStudent.id, studentData);
            } else {
                await apiService.createStudent(studentData);
            }
            setShowModal(false);
            setEditingStudent(null);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Erro ao salvar aluno:', error);
        }
    };

    const formatDateForInput = (date: string | Date | null | undefined): string => {
        if (!date) return '';
        if (typeof date === 'string') {
            // Se já é uma string, retornar apenas a parte da data (YYYY-MM-DD)
            return date.split('T')[0];
        }
        if (date instanceof Date) {
            // Se é um objeto Date, formatar para YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return '';
    };

    const handleEdit = async (student: Student) => {
        if (!student.id) {
            console.error('Aluno sem ID para edição');
            return;
        }

        try {
            // Buscar os dados completos do aluno para garantir que temos todos os campos atualizados
            const studentRes = await apiService.getStudent(student.id);
            const fullStudent = studentRes.data || student;
            
            setEditingStudent(fullStudent);
            setFormData({
                nome: fullStudent.nome || '',
                email: fullStudent.email || '',
                telefone: fullStudent.telefone || '',
                cpf: fullStudent.cpf || '',
                cep: fullStudent.cep || '',
                cidade: fullStudent.cidade || '',
                estado: fullStudent.estado || '',
                bairro: fullStudent.bairro || '',
                pais: fullStudent.pais || 'Brasil',
                numero_endereco: fullStudent.numero_endereco || '',
                complemento: fullStudent.complemento || '',
                codigo: fullStudent.codigo || '',
                responsavel: fullStudent.responsavel || '',
                observacao: fullStudent.observacao || '',
                empresa_id: fullStudent.empresa_id?.toString() || '',
                funcao_id: fullStudent.funcao_id?.toString() || '',
                data_admissao: formatDateForInput(fullStudent.data_admissao),
                contato_rh: fullStudent.contato_rh || '',
                data_desligamento: formatDateForInput(fullStudent.data_desligamento)
            });
            setShowModal(true);
        } catch (error) {
            console.error('Erro ao carregar dados do aluno:', error);
            // Fallback: usar os dados do student passado
            setEditingStudent(student);
            setFormData({
                nome: student.nome || '',
                email: student.email || '',
                telefone: student.telefone || '',
                cpf: student.cpf || '',
                cep: student.cep || '',
                cidade: student.cidade || '',
                estado: student.estado || '',
                bairro: student.bairro || '',
                pais: student.pais || 'Brasil',
                numero_endereco: student.numero_endereco || '',
                complemento: student.complemento || '',
                codigo: student.codigo || '',
                responsavel: student.responsavel || '',
                observacao: student.observacao || '',
                empresa_id: student.empresa_id?.toString() || '',
                funcao_id: student.funcao_id?.toString() || '',
                data_admissao: formatDateForInput(student.data_admissao),
                contato_rh: student.contato_rh || '',
                data_desligamento: formatDateForInput(student.data_desligamento)
            });
            setShowModal(true);
        }
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
        const matchesSearch = 
            (student.nome && student.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            student.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.observacao && student.observacao.toLowerCase().includes(searchTerm.toLowerCase()));
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
                        <div className="text-sm font-medium text-gray-900">{student.nome || student.codigo}</div>
                        <div className="text-sm text-gray-500">{student.email || student.responsavel}</div>
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
            icon: <FileText className="w-4 h-4" />,
            onClick: (student) => {
                if (student.id) {
                    navigate(`/alunos/${student.id}/respostas`);
                }
            },
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
            onClick: (student) => {
                if (student.id) {
                    handleDelete(student.id);
                }
            },
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
                    data={filteredStudents.filter(s => s.id !== undefined) as (Student & { id: number })[]}
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