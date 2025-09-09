import React from 'react';
import { TextInput, FormActions } from '../inputs';
import type { Function } from '../../types';

export interface FunctionFormData {
    codigo: string;
    nome_funcao: string;
}

export interface FunctionFormProps {
    formData: FunctionFormData;
    onFormDataChange: (data: FunctionFormData) => void;
    editingFunction?: Function | null;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading?: boolean;
    errors?: { [key: string]: string };
}

const FunctionForm: React.FC<FunctionFormProps> = ({
    formData,
    onFormDataChange,
    editingFunction,
    onSubmit,
    onCancel,
    isLoading = false,
    errors = {}
}) => {
    const updateField = (field: keyof FunctionFormData, value: string) => {
        onFormDataChange({
            ...formData,
            [field]: value
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Código */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código *
                </label>
                <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => updateField('codigo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.codigo ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'
                    }`}
                />
                {errors.codigo && (
                    <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                )}
            </div>

            {/* Nome da Função */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Função *
                </label>
                <input
                    type="text"
                    required
                    value={formData.nome_funcao}
                    onChange={(e) => updateField('nome_funcao', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.nome_funcao ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'
                    }`}
                />
                {errors.nome_funcao && (
                    <p className="mt-1 text-sm text-red-600">{errors.nome_funcao}</p>
                )}
            </div>

            {/* Botões */}
            <FormActions
                onCancel={onCancel}
                onSubmit={() => {}}
                submitLabel={editingFunction ? 'Atualizar' : 'Cadastrar'}
                isLoading={isLoading}
            />
        </form>
    );
};

export default FunctionForm;
