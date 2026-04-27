import React, { useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    User,
    Building,
    DownloadCloud,
} from 'lucide-react';
import type { Employee } from '../../types';
import DataTable, { type Column, type ActionButton } from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import Modal from '../../components/Modal';
import ReportModal, { type ReportOption } from '../../components/ReportModal';
import { EmployeeForm, type EmployeeFormData } from '../../components/forms';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../../hooks/useEmployees';
import { useFunctions } from '../../hooks/useFunctions';

const Employees: React.FC = () => {
    const { data: employees = [], isLoading: loading } = useEmployees();
    const { data: functions = [] } = useFunctions();
    const createEmployee = useCreateEmployee();
    const updateEmployee = useUpdateEmployee();
    const deleteEmployee = useDeleteEmployee();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFunction, setSelectedFunction] = useState<string>('');
    const [reportModalOpen, setReportModalOpen] = useState(false);

    const employeeReportOptions: ReportOption[] = [
      { label: 'Lista completa de funcionários', type: 'full', description: 'Todos os funcionários com função e contato' },
      { label: 'Funcionários agrupados por função', type: 'by-function', description: 'Funcionários organizados por cargo/função' },
    ];
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<EmployeeFormData>({
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
        contato_empresarial: '',
        funcao_id: '',
        senha: '',
        confirmacao_senha: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação das senhas
        if (!editingEmployee && formData.senha !== formData.confirmacao_senha) {
            alert('As senhas não coincidem!');
            return;
        }

        if (editingEmployee && formData.senha && formData.senha !== formData.confirmacao_senha) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            // Remove o campo confirmacao_senha antes de enviar para a API
            const { confirmacao_senha, ...dataToSend } = formData;

            if (editingEmployee) {
                const finalData = formData.senha ? dataToSend : {
                    nome: dataToSend.nome,
                    email: dataToSend.email,
                    telefone: dataToSend.telefone,
                    cpf: dataToSend.cpf,
                    cep: dataToSend.cep,
                    cidade: dataToSend.cidade,
                    estado: dataToSend.estado,
                    bairro: dataToSend.bairro,
                    pais: dataToSend.pais,
                    numero_endereco: dataToSend.numero_endereco,
                    complemento: dataToSend.complemento,
                    contato_empresarial: dataToSend.contato_empresarial,
                    funcao_id: dataToSend.funcao_id
                };
                await updateEmployee.mutateAsync({ id: editingEmployee.id, data: finalData });
            } else {
                await createEmployee.mutateAsync(dataToSend);
            }
            setShowModal(false);
            setEditingEmployee(null);
            resetForm();
        } catch (error) {
            console.error('Erro ao salvar funcionário:', error);
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            nome: employee.nome,
            email: employee.email,
            telefone: employee.telefone,
            cpf: employee.cpf,
            cep: employee.cep || '',
            cidade: employee.cidade,
            estado: employee.estado,
            bairro: employee.bairro,
            pais: employee.pais,
            numero_endereco: employee.numero_endereco,
            complemento: employee.complemento || '',
            contato_empresarial: employee.contato_empresarial,
            funcao_id: employee.funcao_id?.toString() || '',
            senha: '',
            confirmacao_senha: ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            try {
                await deleteEmployee.mutateAsync(id);
            } catch (error) {
                console.error('Erro ao excluir funcionário:', error);
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
            contato_empresarial: '',
            funcao_id: '',
            senha: '',
            confirmacao_senha: ''
        });
    };

    const openNewModal = () => {
        setEditingEmployee(null);
        resetForm();
        setShowModal(true);
    };


    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.contato_empresarial.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFunction = !selectedFunction || employee.funcao_id?.toString() === selectedFunction;

        return matchesSearch && matchesFunction;
    });

    const getFunctionName = (functionId?: number) => {
        return functions.find(f => f.id === functionId)?.nome_funcao || 'N/A';
    };

    // Definição das colunas da tabela
    const employeeColumns: Column<Employee>[] = [
        {
            key: 'funcionario',
            label: 'Funcionário',
            render: (employee) => (
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.nome}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'contato_empresarial',
            label: 'Contato Empresarial'
        },
        {
            key: 'funcao',
            label: 'Função',
            render: (employee) => getFunctionName(employee.funcao_id)
        },
        {
            key: 'localizacao',
            label: 'Localização',
            render: (employee) => (
                <div className="flex items-center">
                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{employee.cidade}, {employee.estado}</span>
                </div>
            )
        }
    ];

    // Definição das ações da tabela
    const employeeActions: ActionButton<Employee>[] = [
        {
            icon: <Edit className="w-4 h-4" />,
            onClick: handleEdit,
            className: "text-blue-600 hover:text-blue-900",
            title: "Editar"
        },
        {
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (employee) => handleDelete(employee.id),
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
                <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Gerencie os cadastros de funcionários do sistema
                </p>
            </div>

            {/* Actions and Filters */}
            <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Buscar por nome, email ou contato..."
                filters={[
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
                        Novo Funcionário
                    </button>
                    
                    <button
                        onClick={() => setReportModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <DownloadCloud className="w-4 h-4 mr-2" />
                        Gerar Relatório
                    </button>
                    </>
                }
            />

            {/* Employees List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Lista de Funcionários ({filteredEmployees.length})
                    </h3>
                </div>

                <DataTable
                    data={filteredEmployees}
                    columns={employeeColumns}
                    actions={employeeActions}
                    emptyState={{
                        icon: <User className="mx-auto h-12 w-12 text-gray-400" />,
                        title: "Nenhum funcionário encontrado",
                        description: searchTerm || selectedFunction
                                ? 'Tente ajustar os filtros de busca.'
                            : 'Comece criando um novo funcionário.'
                    }}
                />
            </div>

            {/* Modal de Cadastro/Edição */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
                size="xl"
            >
                <EmployeeForm
                    formData={formData}
                    onFormDataChange={setFormData}
                    functions={functions}
                    editingEmployee={editingEmployee}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>

            <ReportModal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                title="Relatórios de Funcionários"
                entity="employees"
                options={employeeReportOptions}
            />
        </div>
    );
};

export default Employees;
