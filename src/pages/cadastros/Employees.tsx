import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    User,
    Building,
    DownloadCloud,
} from 'lucide-react';
import { apiService } from '../../services/api';
import type { Employee, Company, Function } from '../../types';
import CepSearch from '../../components/CepSearch';
import type { CepResponse } from '../../services/cepService';

const Employees: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [functions, setFunctions] = useState<Function[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [selectedFunction, setSelectedFunction] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [employeesRes, companiesRes, functionsRes] = await Promise.all([
                apiService.getEmployees(),
                apiService.getCompanies(),
                apiService.getFunctions()
            ]);

            setEmployees(employeesRes.data || []);
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
                // Se estiver editando, só envia senha se ela foi preenchida
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
                await apiService.updateEmployee(editingEmployee.id, finalData);
            } else {
                await apiService.createEmployee(dataToSend);
            }
            setShowModal(false);
            setEditingEmployee(null);
            resetForm();
            loadData();
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
                await apiService.deleteEmployee(id);
                loadData();
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

    const handleCepFound = (cepData: CepResponse) => {
        setFormData(prev => ({
            ...prev,
            cep: cepData.cep,
            cidade: cepData.localidade,
            estado: cepData.uf,
            bairro: cepData.bairro
        }));
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className='space-x-2'>
                    <button
                        onClick={openNewModal}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Funcionário
                    </button>
                    
                    <button
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <DownloadCloud className="w-4 h-4 mr-2" />
                        Gerar Relatôrio
                    </button>
                </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, email ou contato..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                            />
                        </div>

                        {/* Function Filter */}
                        <select
                            value={selectedFunction}
                            onChange={(e) => setSelectedFunction(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todas as funções</option>
                            {functions.map(func => (
                                <option key={func.id} value={func.id.toString()}>
                                    {func.nome_funcao}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Employees List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Lista de Funcionários ({filteredEmployees.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Funcionário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contato Empresarial
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Função
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Localização
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{employee.nome}</div>
                                                <div className="text-sm text-gray-500">{employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.contato_empresarial}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getFunctionName(employee.funcao_id)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <Building className="w-4 h-4 text-gray-400 mr-2" />
                                            <span>{employee.cidade}, {employee.estado}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(employee)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(employee.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredEmployees.length === 0 && (
                    <div className="text-center py-12">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum funcionário encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedFunction
                                ? 'Tente ajustar os filtros de busca.'
                                : 'Comece criando um novo funcionário.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de Cadastro/Edição */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Informações Pessoais */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telefone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CPF *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.cpf}
                                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contato Empresarial *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.contato_empresarial}
                                        onChange={(e) => setFormData({ ...formData, contato_empresarial: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Telefone ou email corporativo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Função *
                                    </label>
                                    <select
                                        required
                                        value={formData.funcao_id}
                                        onChange={(e) => setFormData({ ...formData, funcao_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Selecione uma função</option>
                                        {functions.map(func => (
                                            <option key={func.id} value={func.id.toString()}>
                                                {func.nome_funcao}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Senha {!editingEmployee ? '*' : '(deixe em branco para manter a atual)'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingEmployee}
                                        value={formData.senha}
                                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Digite a senha"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmação de Senha {!editingEmployee ? '*' : '(deixe em branco para manter a atual)'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingEmployee}
                                        value={formData.confirmacao_senha}
                                        onChange={(e) => setFormData({ ...formData, confirmacao_senha: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Confirme a senha"
                                    />
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="border-t pt-6">
                                <h4 className="text-md font-medium text-gray-900 mb-4">Endereço</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className='col-span-3'>
                                        <CepSearch onCepFound={handleCepFound} />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cidade *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.cidade}
                                            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Estado *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.estado}
                                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bairro *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.bairro}
                                            onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Número *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.numero_endereco}
                                            onChange={(e) => setFormData({ ...formData, numero_endereco: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Complemento
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.complemento}
                                            onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            País
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.pais}
                                            onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex justify-end space-x-3 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {editingEmployee ? 'Atualizar' : 'Cadastrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
