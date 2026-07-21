'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PageHeader from '@/components/shared/PageHeader';

interface Period {
    id: number;
    name: string;
    status: string;
}

interface FacultyResult {
    id: number;
    final_score: string;
    performance_rating: string;
    total_evaluators: number;
    faculty: {
        id: number;
        first_name: string;
        last_name: string;
        employee_id: string;
    };
}

export default function ReportsPage() {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [results, setResults] = useState<FacultyResult[]>([]);
    const [participation, setParticipation] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'faculty' | 'participation'>('faculty');

    useEffect(() => {
        fetchPeriods();
    }, []);

    useEffect(() => {
        if (selectedPeriod) {
            fetchReports();
        }
    }, [selectedPeriod, activeTab]);

    const fetchPeriods = async () => {
        try {
            const response = await api.get('/admin/evaluation-periods');
            setPeriods(response.data.data);
            const published = response.data.data.find((p: Period) => p.status === 'published');
            if (published) setSelectedPeriod(String(published.id));
        } catch (error) {
            console.error('Failed to fetch periods:', error);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            if (activeTab === 'faculty') {
                const response = await api.get('/admin/results/period', {
                    params: { evaluation_period_id: selectedPeriod }
                });
                setResults(response.data.data.results ?? []);
            } else {
                const response = await api.get('/admin/reports/participation', {
                    params: { evaluation_period_id: selectedPeriod }
                });
                setParticipation(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'Outstanding': return 'bg-green-100 text-green-700';
            case 'Very Satisfactory': return 'bg-blue-100 text-blue-700';
            case 'Satisfactory': return 'bg-yellow-100 text-yellow-700';
            case 'Needs Improvement': return 'bg-orange-100 text-orange-700';
            case 'Poor': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const downloadPdf = async (facultyId: number) => {
        try {
            const response = await api.get('/admin/reports/faculty/pdf', {
                params: {
                    evaluation_period_id: selectedPeriod,
                    faculty_id: facultyId,
                },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `faculty-report-${facultyId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            alert('Failed to download report.');
        }
    };

    return (
        <div className="p-8">
            <PageHeader
                title="Reports"
                description="View and download evaluation reports."
            />

            {/* Period Selector */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Evaluation Period</label>
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full md:w-96 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">Select a period</option>
                    {periods.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {selectedPeriod && (
                <>
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {(['faculty', 'participation'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    activeTab === tab
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {tab === 'faculty' ? 'Faculty Results' : 'Participation'}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="inline-block w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : activeTab === 'faculty' ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-6">
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Faculty Results</h2>
                            {results.length === 0 ? (
                                <p className="text-sm text-gray-400">No results available for this period.</p>
                            ) : (
                                <div className="space-y-3">
                                    {results.map((result) => (
                                        <div key={result.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                                                    {result.faculty?.first_name?.[0]}{result.faculty?.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {result.faculty?.first_name} {result.faculty?.last_name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{result.faculty?.employee_id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-indigo-600">{result.final_score}</p>
                                                    <p className="text-xs text-gray-400">{result.total_evaluators} evaluators</p>
                                                </div>
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getRatingColor(result.performance_rating)}`}>
                                                    {result.performance_rating}
                                                </span>
                                                <button
                                                    onClick={() => downloadPdf(result.faculty.id)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    PDF
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        participation && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Students', value: participation.total_students },
                                    { label: 'Students Evaluated', value: participation.students_evaluated },
                                    { label: 'Total Faculty', value: participation.total_faculty },
                                    { label: 'Faculty Evaluated', value: participation.faculty_evaluated },
                                    { label: 'Total Evaluations', value: participation.total_evaluations },
                                    { label: 'Student Evaluations', value: participation.student_evaluations },
                                    { label: 'Peer Evaluations', value: participation.peer_evaluations },
                                    { label: 'Completion Rate', value: `${participation.completion_rate}%` },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
                                        <div className="text-2xl font-semibold text-indigo-600 mb-1">{stat.value}</div>
                                        <div className="text-xs text-gray-500">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}