'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function FacultyDashboardPage() {
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
            const response = await api.get('/dashboard/faculty');
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
                <p className="text-sm text-gray-500 mt-1">Welcome back, {data?.faculty?.name}</p>
            </div>

            {/* Latest Result */}
            {data?.latest_result ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                        <div className="text-4xl font-semibold text-indigo-600 mb-1">
                            {data.latest_result.final_score}
                        </div>
                        <div className="text-sm text-gray-500">Final Score</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                        <div className="text-2xl font-semibold text-green-600 mb-1">
                            {data.latest_result.performance_rating}
                        </div>
                        <div className="text-sm text-gray-500">Performance Rating</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                        <div className="text-4xl font-semibold text-blue-600 mb-1">
                            {data.latest_result.total_evaluators}
                        </div>
                        <div className="text-sm text-gray-500">Total Evaluators</div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                    <p className="text-sm text-gray-500">No evaluation results available yet.</p>
                </div>
            )}

            {/* Current Assignments */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Current Assignments</h2>
                {data?.current_assignments?.length === 0 ? (
                    <p className="text-sm text-gray-400">No current assignments.</p>
                ) : (
                    <div className="space-y-3">
                        {data?.current_assignments?.map((assignment: any) => (
                            <div key={assignment.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{assignment.subject?.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{assignment.section?.name} · {assignment.semester?.name}</p>
                                </div>
                                <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                    {assignment.subject?.code}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}