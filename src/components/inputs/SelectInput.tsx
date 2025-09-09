import React from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    required?: boolean;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
    label,
    value,
    onChange,
    options,
    required = false,
    placeholder = 'Selecione uma opção',
    className = '',
    disabled = false
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && '*'}
            </label>
            <select
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectInput;
