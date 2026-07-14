'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AdminDashboardData {
    system_overview: {
        total_users: number;
        total_faculty: number;
        total_students: number;
        total_colleges: number;
        total_departments: number;
    };
    active_period: {
        id: number;
        name: string;
        status: string;
    } | null;
    recent_periods: Array<{
        id: number;
        name: string;
        status: string;
        start_date: string;
        end_date: string;
    }>;
}

export default function AdminDashboardPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }
        if (!user.roles.includes('administrator') && !user.roles.includes('super_admin')) {
            router.push('/dashboard');
            return;
        }
        fetchDashboard();
    }, [user, isLoading]);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/dashboard/admin');
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="font-semibold text-gray-900">FES</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500">Administrator</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{user?.name}</span>
                        <button
                            onClick={logout}
                            className="text-sm text-gray-500 hover:text-gray-900 transition"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
                </div>

                {/* Active Period Banner */}
                {data?.active_period ? (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <div>
                                <p className="text-sm font-medium text-indigo-900">Active Evaluation Period</p>
                                <p className="text-xs text-indigo-600">{data.active_period.name}</p>
                            </div>
                        </div>
                        <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            {data.active_period.status}
                        </span>
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-500">No active evaluation period at the moment.</p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Total Users', value: data?.system_overview.total_users ?? 0, color: 'bg-indigo-50 text-indigo-600' },
                        { label: 'Faculty', value: data?.system_overview.total_faculty ?? 0, color: 'bg-green-50 text-green-600' },
                        { label: 'Students', value: data?.system_overview.total_students ?? 0, color: 'bg-blue-50 text-blue-600' },
                        { label: 'Colleges', value: data?.system_overview.total_colleges ?? 0, color: 'bg-purple-50 text-purple-600' },
                        { label: 'Departments', value: data?.system_overview.total_departments ?? 0, color: 'bg-orange-50 text-orange-600' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
                            <div className={`text-2xl font-semibold ${stat.color.split(' ')[1]} mb-1`}>
                                {stat.value}
                            </div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Periods */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Evaluation Periods</h2>
                    {data?.recent_periods.length === 0 ? (
                        <p className="text-sm text-gray-400">No evaluation periods yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {data?.recent_periods.map((period) => (
                                <div key={period.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{period.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(period.start_date).toLocaleDateString()} — {new Date(period.end_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                                        period.status === 'open' ? 'bg-green-100 text-green-700' :
                                        period.status === 'published' ? 'bg-blue-100 text-blue-700' :
                                        period.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {period.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}