import React from 'react';
import { TextInput, FormSection, FormActions } from '../inputs';
import CepSearch from '../CepSearch';
import type { Company } from '../../types';
import type { CepResponse } from '../../services/cepService';

export interface CompanyFormData {
    razao_social: string;
    cnpj: string;
    cep: string;
    cidade: string;
    estado: string;
    bairro: string;
    pais: string;
    numero_endereco: string;
    complemento: string;
}

export interface CompanyFormProps {
    formData: CompanyFormData;
    onFormDataChange: (data: CompanyFormData) => void;
    editingCompany?: Company | null;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading?: boolean;
    errors?: { [key: string]: string };
}

const CompanyForm: React.FC<CompanyFormProps> = ({
    formData,
    onFormDataChange,
    editingCompany,
    onSubmit,
    onCancel,
    isLoading = false,
    errors = {}
}) => {
    const updateField = (field: keyof CompanyFormData, value: string) => {
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
            {/* Informações da Empresa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Razão Social *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.razao_social}
                            onChange={(e) => updateField('razao_social', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                                errors.razao_social ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.razao_social && (
                            <p className="mt-1 text-sm text-red-600">{errors.razao_social}</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            CNPJ *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.cnpj}
                            onChange={(e) => updateField('cnpj', e.target.value)}
                            placeholder="00.000.000/0000-00"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                                errors.cnpj ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.cnpj && (
                            <p className="mt-1 text-sm text-red-600">{errors.cnpj}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Endereço */}
            <FormSection title="Endereço">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CEP */}
                    <div className="col-span-3">
                        <CepSearch onCepFound={handleCepFound} />
                    </div>

                    {/* Cidade */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cidade *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.cidade}
                            onChange={(e) => updateField('cidade', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                                errors.cidade ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.cidade && (
                            <p className="mt-1 text-sm text-red-600">{errors.cidade}</p>
                        )}
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.estado}
                            onChange={(e) => updateField('estado', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                                errors.estado ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.estado && (
                            <p className="mt-1 text-sm text-red-600">{errors.estado}</p>
                        )}
                    </div>

                    {/* País */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            País *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.pais}
                            onChange={(e) => updateField('pais', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                                errors.pais ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.pais && (
                            <p className="mt-1 text-sm text-red-600">{errors.pais}</p>
                        )}
                    </div>

                    {/* Bairro */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bairro *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.bairro}
                            onChange={(e) => updateField('bairro', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                                errors.bairro ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.bairro && (
                            <p className="mt-1 text-sm text-red-600">{errors.bairro}</p>
                        )}
                    </div>

                    {/* Número do Endereço */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.numero_endereco}
                            onChange={(e) => updateField('numero_endereco', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                                errors.numero_endereco ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.numero_endereco && (
                            <p className="mt-1 text-sm text-red-600">{errors.numero_endereco}</p>
                        )}
                    </div>

                    {/* Complemento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Complemento
                        </label>
                        <input
                            type="text"
                            value={formData.complemento}
                            onChange={(e) => updateField('complemento', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </FormSection>

            {/* Botões */}
            <FormActions
                onCancel={onCancel}
                onSubmit={() => {}}
                submitLabel={editingCompany ? 'Atualizar' : 'Cadastrar'}
                isLoading={isLoading}
            />
        </form>
    );
};

export default CompanyForm;
