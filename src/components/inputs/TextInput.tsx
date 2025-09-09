import React from 'react';

export interface TextInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'email' | 'tel' | 'password';
    required?: boolean;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    placeholder,
    className = '',
    disabled = false
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && '*'}
            </label>
            <input
                type={type}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
        </div>
    );
};

export default TextInput;
