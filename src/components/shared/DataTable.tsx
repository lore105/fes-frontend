'use client';

interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
}

export default function DataTable<T extends { id: number }>({
    columns,
    data,
    isLoading,
    emptyMessage = 'No data found.',
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="inline-block w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100">
                        {columns.map((col) => (
                            <th key={col.key} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center text-sm text-gray-400 py-8">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                {columns.map((col) => (
                                    <td key={col.key} className="py-3 px-4 text-sm text-gray-700">
                                        {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}