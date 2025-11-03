import React from 'react';
import { Search } from 'lucide-react';

export interface FilterOption {
    value: string;
    label: string;
}

export interface SearchFilterProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    filters?: {
        label: string;
        value: string;
        options: FilterOption[];
        onChange: (value: string) => void;
    }[];
    actions?: React.ReactNode;
    className?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
    searchTerm,
    onSearchChange,
    searchPlaceholder = "Buscar...",
    filters = [],
    actions,
    className = ''
}) => {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {actions && (
                    <div className="space-x-2">
                        {actions}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                        />
                    </div>

                    {/* Filters */}
                    {filters.map((filter, index) => (
                        <select
                            key={index}
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">{filter.label}</option>
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchFilter;
