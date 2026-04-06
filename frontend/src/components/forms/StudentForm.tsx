import React from 'react';
import { TextInput, FormSection, FormActions } from '../inputs';
import CepSearch from '../CepSearch';
import type { Student } from '../../types';
import type { CepResponse } from '../../services/cepService';

export interface StudentFormData {
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
    codigo: string;
    responsavel: string;
    observacao: string;
}

export interface StudentFormProps {
    formData: StudentFormData;
    onFormDataChange: (data: StudentFormData) => void;
    editingStudent?: Student | null;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
    formData,
    onFormDataChange,
    editingStudent,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    const updateField = (field: keyof StudentFormData, value: string) => {
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
                    label="Código do Aluno"
                    value={formData.codigo}
                    onChange={(value) => updateField('codigo', value)}
                    required
                />

                <TextInput
                    label="Responsável"
                    value={formData.responsavel}
                    onChange={(value) => updateField('responsavel', value)}
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

            {/* Observações */}
            <FormSection title="Observações">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações
                    </label>
                    <textarea
                        rows={3}
                        value={formData.observacao}
                        onChange={(e) => updateField('observacao', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Observações adicionais sobre o aluno..."
                    />
                </div>
            </FormSection>

            {/* Botões */}
            <FormActions
                onCancel={onCancel}
                onSubmit={() => {}}
                submitLabel={editingStudent ? 'Atualizar' : 'Cadastrar'}
                isLoading={isLoading}
            />
        </form>
    );
};

export default StudentForm;
