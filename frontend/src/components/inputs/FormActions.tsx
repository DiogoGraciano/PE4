import React from 'react';

export interface FormActionsProps {
    onCancel: () => void;
    onSubmit: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    className?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
    onCancel,
    onSubmit,
    submitLabel = 'Salvar',
    cancelLabel = 'Cancelar',
    isLoading = false,
    className = ''
}) => {
    return (
        <div className={`flex justify-end space-x-3 pt-6 border-t ${className}`}>
            <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {cancelLabel}
            </button>
            <button
                type="submit"
                onClick={onSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Salvando...' : submitLabel}
            </button>
        </div>
    );
};

export default FormActions;
