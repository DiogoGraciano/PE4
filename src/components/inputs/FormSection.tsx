import React from 'react';

export interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
    title,
    children,
    className = ''
}) => {
    return (
        <div className={`border-t pt-6 ${className}`}>
            <h4 className="text-md font-medium text-gray-900 mb-4">{title}</h4>
            {children}
        </div>
    );
};

export default FormSection;
