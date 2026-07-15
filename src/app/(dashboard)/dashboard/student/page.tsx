'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function StudentDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return;
        if (!user) { router.push('/login'); return; }
        fetchDashboard();
    }, [user, isLoading]);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/dashboard/student');
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">My Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back, {data?.student?.name}</p>
            </div>

            {/* Evaluation Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                    <div className="text-4xl font-semibold text-indigo-600 mb-1">
                        {data?.evaluation_progress?.total ?? 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Evaluations</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                    <div className="text-4xl font-semibold text-green-600 mb-1">
                        {data?.evaluation_progress?.completed ?? 0}
                    </div>
                    <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                    <div className="text-4xl font-semibold text-orange-600 mb-1">
                        {data?.evaluation_progress?.pending ?? 0}
                    </div>
                    <div className="text-sm text-gray-500">Pending</div>
                </div>
            </div>

            {/* Enrollments */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">My Enrollments</h2>
                {data?.enrollments?.length === 0 ? (
                    <p className="text-sm text-gray-400">No enrollments found.</p>
                ) : (
                    <div className="space-y-3">
                        {data?.enrollments?.map((enrollment: any) => (
                            <div key={enrollment.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{enrollment.subject?.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{enrollment.section?.name} · {enrollment.semester?.name}</p>
                                </div>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                                    enrollment.status === 'enrolled' ? 'bg-green-100 text-green-700' :
                                    enrollment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {enrollment.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}