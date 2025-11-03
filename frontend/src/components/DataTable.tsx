import React from 'react';
import { User, Building } from 'lucide-react';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

export interface ActionButton<T> {
    icon: React.ReactNode;
    onClick: (item: T) => void;
    className?: string;
    title?: string;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    actions?: ActionButton<T>[];
    emptyState?: {
        icon: React.ReactNode;
        title: string;
        description: string;
    };
    loading?: boolean;
    className?: string;
}

function DataTable<T extends { id: number | string }>({
    data,
    columns,
    actions = [],
    emptyState,
    loading = false,
    className = ''
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                                >
                                    {column.label}
                                </th>
                            ))}
                            {actions.length > 0 && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                {columns.map((column, index) => (
                                    <td
                                        key={index}
                                        className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                                    >
                                        {column.render ? column.render(item) : String(item[column.key as keyof T] || '')}
                                    </td>
                                ))}
                                {actions.length > 0 && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {actions.map((action, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => action.onClick(item)}
                                                    className={`p-1 ${action.className || ''}`}
                                                    title={action.title}
                                                >
                                                    {action.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.length === 0 && emptyState && (
                <div className="text-center py-12">
                    {emptyState.icon}
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyState.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{emptyState.description}</p>
                </div>
            )}
        </div>
    );
}

export default DataTable;
