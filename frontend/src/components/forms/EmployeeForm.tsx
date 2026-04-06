import React from 'react';
import { TextInput, SelectInput, FormSection, FormActions } from '../inputs';
import CepSearch from '../CepSearch';
import { ROLE_PERMISSIONS } from '../../constants/rolePermissions';
import type { Employee, Function } from '../../types';
import type { CepResponse } from '../../services/cepService';

export interface EmployeeFormData {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    cep: string;
    cidade: string;
    estado: string;
    bairro: string;
    pais: string;
    numero_endereco: string;
    complemento: string;
    contato_empresarial: string;
    funcao_id: string;
    senha: string;
    confirmacao_senha: string;
}

export interface EmployeeFormProps {
    formData: EmployeeFormData;
    onFormDataChange: (data: EmployeeFormData) => void;
    functions: Function[];
    editingEmployee?: Employee | null;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
    formData,
    onFormDataChange,
    functions,
    editingEmployee,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    const updateField = (field: keyof EmployeeFormData, value: string) => {
        onFormDataChange({
            ...formData,
            [field]: value
        });
    };

    const handleCepFound = (cepData: CepResponse) => {
        onFormDataChange({
            ...formData,
            cep: cepData.cep,
            cidade: cepData.localidade,
            estado: cepData.uf,
            bairro: cepData.bairro
        });
    };

    const functionOptions = functions.map(func => ({
        value: func.id.toString(),
        label: `${func.codigo} – ${func.nome_funcao}`
    }));

    const selectedFunction = formData.funcao_id
        ? functions.find(f => f.id === +formData.funcao_id)
        : null;
    const roleCodigo = selectedFunction?.codigo;
    const permissions = roleCodigo ? ROLE_PERMISSIONS[roleCodigo] : null;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Informações Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                    label="Nome Completo"
                    value={formData.nome}
                    onChange={(value) => updateField('nome', value)}
                    required
                />

                <TextInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(value) => updateField('email', value)}
                    required
                />

                <TextInput
                    label="Telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={(value) => updateField('telefone', value)}
                    required
                />

                <TextInput
                    label="CPF"
                    value={formData.cpf}
                    onChange={(value) => updateField('cpf', value)}
                    required
                />

                <TextInput
                    label="Contato Empresarial"
                    value={formData.contato_empresarial}
                    onChange={(value) => updateField('contato_empresarial', value)}
                    placeholder="Telefone ou email corporativo"
                    required
                />

                <SelectInput
                    label="Cargo / Regra"
                    value={formData.funcao_id}
                    onChange={(value) => updateField('funcao_id', value)}
                    options={functionOptions}
                    placeholder="Selecione um cargo"
                    required
                />

                {permissions ? (
                    <div className="md:col-span-2 rounded-md border border-gray-200 bg-gray-50 p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Permissões desta regra</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {permissions.map((perm, i) => (
                                <li key={i}>{perm}</li>
                            ))}
                        </ul>
                    </div>
                ) : formData.funcao_id ? null : (
                    <p className="md:col-span-2 text-sm text-gray-500">Selecione um cargo para ver as permissões.</p>
                )}

                <TextInput
                    label={`Senha ${!editingEmployee ? '*' : '(deixe em branco para manter a atual)'}`}
                    type="password"
                    value={formData.senha}
                    onChange={(value) => updateField('senha', value)}
                    placeholder="Digite a senha"
                    required={!editingEmployee}
                />

                <TextInput
                    label={`Confirmação de Senha ${!editingEmployee ? '*' : '(deixe em branco para manter a atual)'}`}
                    type="password"
                    value={formData.confirmacao_senha}
                    onChange={(value) => updateField('confirmacao_senha', value)}
                    placeholder="Confirme a senha"
                    required={!editingEmployee}
                />
            </div>

            {/* Endereço */}
            <FormSection title="Endereço">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-3">
                        <CepSearch onCepFound={handleCepFound} value={formData.cep} />
                    </div>
                    
                    <TextInput
                        label="Cidade"
                        value={formData.cidade}
                        onChange={(value) => updateField('cidade', value)}
                        required
                    />

                    <TextInput
                        label="Estado"
                        value={formData.estado}
                        onChange={(value) => updateField('estado', value)}
                        required
                    />

                    <TextInput
                        label="Bairro"
                        value={formData.bairro}
                        onChange={(value) => updateField('bairro', value)}
                        required
                    />

                    <TextInput
                        label="Número"
                        value={formData.numero_endereco}
                        onChange={(value) => updateField('numero_endereco', value)}
                        required
                    />

                    <TextInput
                        label="Complemento"
                        value={formData.complemento}
                        onChange={(value) => updateField('complemento', value)}
                    />

                    <TextInput
                        label="País"
                        value={formData.pais}
                        onChange={(value) => updateField('pais', value)}
                    />
                </div>
            </FormSection>

            {/* Botões */}
            <FormActions
                onCancel={onCancel}
                onSubmit={() => {}}
                submitLabel={editingEmployee ? 'Atualizar' : 'Cadastrar'}
                isLoading={isLoading}
            />
        </form>
    );
};

export default EmployeeForm;
