import React, { useState } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Eye, EyeOff } from 'lucide-react';
import type { QuestionField } from '../types';

interface FormBuilderProps {
  fields: QuestionField[];
  onChange: (fields: QuestionField[]) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ fields, onChange }) => {
  const [showPreview, setShowPreview] = useState(true);
  const [showFieldModal, setShowFieldModal] = useState(false);

  const fieldTypes = [
    { value: 'input', label: 'Campo de Texto', icon: '📝' },
    { value: 'textarea', label: 'Área de Texto', icon: '📄' },
    { value: 'select', label: 'Seleção Única', icon: '🔽' },
    { value: 'checkbox', label: 'Seleção Múltipla', icon: '☑️' },
    { value: 'radio', label: 'Opção Única', icon: '🔘' }
  ];

  const addField = (type: string) => {
    const newField: QuestionField = {
      id: `campo_${Date.now()}`,
      type: type as QuestionField['type'],
      label: `Novo ${type}`,
      required: false
    };

    if (type === 'select' || type === 'checkbox' || type === 'radio') {
      newField.options = ['Opção 1', 'Opção 2'];
    }

    if (type === 'input' || type === 'textarea') {
      newField.placeholder = `Digite ${type === 'input' ? 'o texto' : 'o conteúdo'}`;
    }

    onChange([...fields, newField]);
    setShowFieldModal(false);
  };

  const updateField = (index: number, updatedField: QuestionField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    onChange(newFields);
  };

  const deleteField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onChange(newFields);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    onChange(newFields);
  };

  const addOption = (fieldIndex: number) => {
    const field = fields[fieldIndex];
    if (!field.options) return;

    const newOptions = [...field.options, `Opção ${field.options.length + 1}`];
    const updatedField = { ...field, options: newOptions };
    updateField(fieldIndex, updatedField);
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex];
    if (!field.options || field.options.length <= 1) return;

    const newOptions = field.options.filter((_, i) => i !== optionIndex);
    const updatedField = { ...field, options: newOptions };
    updateField(fieldIndex, updatedField);
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const field = fields[fieldIndex];
    if (!field.options) return;

    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    const updatedField = { ...field, options: newOptions };
    updateField(fieldIndex, updatedField);
  };

  const renderFieldEditor = (field: QuestionField, index: number) => {
    return (
      <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {fieldTypes.find(t => t.value === field.type)?.icon}
            </span>
            <span className="font-medium text-gray-700">
              {fieldTypes.find(t => t.value === field.type)?.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveField(index, 'up')}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              title="Mover para cima"
            >
              <MoveUp size={16} />
            </button>
            <button
              onClick={() => moveField(index, 'down')}
              disabled={index === fields.length - 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              title="Mover para baixo"
            >
              <MoveDown size={16} />
            </button>
            <button
              onClick={() => deleteField(index)}
              className="p-1 text-red-600 hover:text-red-800"
              title="Excluir campo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID do Campo
            </label>
            <input
              type="text"
              value={field.id}
              onChange={(e) => updateField(index, { ...field, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rótulo
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(index, { ...field, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(field.type === 'input' || field.type === 'textarea') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => updateField(index, { ...field, placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) => updateField(index, { ...field, required: e.target.checked })}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Campo obrigatório</span>
            </label>
          </div>
        </div>

        {/* Validações para campos de texto */}
        {(field.type === 'input' || field.type === 'textarea') && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Validações</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mínimo de caracteres</label>
                <input
                  type="number"
                  value={field.validation?.minLength || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    const validation = { ...field.validation, minLength: value };
                    updateField(index, { ...field, validation });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: 3"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Máximo de caracteres</label>
                <input
                  type="number"
                  value={field.validation?.maxLength || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    const validation = { ...field.validation, maxLength: value };
                    updateField(index, { ...field, validation });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: 100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Padrão (regex)</label>
                <input
                  type="text"
                  value={field.validation?.pattern || ''}
                  onChange={(e) => {
                    const validation = { ...field.validation, pattern: e.target.value };
                    updateField(index, { ...field, validation });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: ^[0-9]+$"
                />
              </div>
            </div>
          </div>
        )}

        {/* Opções para campos de seleção */}
        {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Opções</h4>
              <button
                onClick={() => addOption(index)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus size={14} />
                Adicionar opção
              </button>
            </div>
            <div className="space-y-2">
              {field.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeOption(index, optionIndex)}
                    disabled={field.options && field.options.length <= 1}
                    className="p-1 text-red-600 hover:text-red-800 disabled:opacity-30"
                    title="Remover opção"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview do Formulário</h3>
        <div className="space-y-4">
          {fields.map((field, index) => {
            switch (field.type) {
              case 'input':
                return (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                    />
                  </div>
                );
              
              case 'textarea':
                return (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                    />
                  </div>
                );
              
              case 'select':
                return (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                      <option value="">Selecione uma opção</option>
                      {field.options?.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                );
              
              case 'checkbox':
                return (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="space-y-2">
                      {field.options?.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              
              case 'radio':
                return (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="space-y-2">
                      {field.options?.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center">
                          <input
                            type="radio"
                            name={field.id}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            disabled
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              
              default:
                return null;
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com botões */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Construtor de Formulário</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFieldModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Adicionar Campo
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showPreview
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
          </button>
        </div>
      </div>

      {/* Modal para adicionar campos */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Adicionar Campo</h3>
              <button
                onClick={() => setShowFieldModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {fieldTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => addField(type.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3 transition-colors"
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="font-medium text-gray-700">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de campos */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg font-medium">Nenhum campo adicionado</p>
            <p className="text-sm">Clique em "Adicionar Campo" para começar a construir seu formulário</p>
          </div>
        ) : (
          fields.map((field, index) => renderFieldEditor(field, index))
        )}
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="mt-8">
          {renderPreview()}
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
