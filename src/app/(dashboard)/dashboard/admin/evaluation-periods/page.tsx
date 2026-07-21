'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

interface EvaluationPeriod {
    id: number;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    allow_student_evaluation: boolean;
    allow_peer_evaluation: boolean;
    allow_supervisor_evaluation: boolean;
    academic_year?: { id: number; name: string };
    semester?: { id: number; name: string };
    template?: { id: number; name: string };
}

interface AcademicYear {
    id: number;
    name: string;
}

interface Semester {
    id: number;
    name: string;
    academic_year_id: number;
}

interface Template {
    id: number;
    name: string;
}

const defaultForm = {
    academic_year_id: '',
    semester_id: '',
    evaluation_template_id: '',
    name: '',
    status: 'draft',
    start_date: '',
    end_date: '',
    allow_student_evaluation: true,
    allow_peer_evaluation: true,
    allow_supervisor_evaluation: true,
};

const statusColors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-700',
    open: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
    published: 'bg-blue-100 text-blue-700',
    archived: 'bg-red-100 text-red-600',
};

export default function EvaluationPeriodsPage() {
    const [periods, setPeriods] = useState<EvaluationPeriod[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<EvaluationPeriod | null>(null);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [periodsRes, yearsRes, semestersRes, templatesRes] = await Promise.all([
                api.get('/admin/evaluation-periods'),
                api.get('/admin/academic-years'),
                api.get('/admin/semesters'),
                api.get('/admin/evaluation-templates'),
            ]);
            setPeriods(periodsRes.data.data);
            setAcademicYears(yearsRes.data.data);
            setSemesters(semestersRes.data.data);
            setTemplates(templatesRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingPeriod(null);
        setForm(defaultForm);
        setError('');
        setModalOpen(true);
    };

    const openEdit = (period: EvaluationPeriod) => {
        setEditingPeriod(period);
        setForm({
            academic_year_id: String(period.academic_year?.id ?? ''),
            semester_id: String(period.semester?.id ?? ''),
            evaluation_template_id: String(period.template?.id ?? ''),
            name: period.name,
            status: period.status,
            start_date: period.start_date?.split('T')[0] ?? '',
            end_date: period.end_date?.split('T')[0] ?? '',
            allow_student_evaluation: period.allow_student_evaluation,
            allow_peer_evaluation: period.allow_peer_evaluation,
            allow_supervisor_evaluation: period.allow_supervisor_evaluation,
        });
        setError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (editingPeriod) {
                await api.patch(`/admin/evaluation-periods/${editingPeriod.id}`, form);
            } else {
                await api.post('/admin/evaluation-periods', form);
            }
            setModalOpen(false);
            fetchAll();
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (period: EvaluationPeriod, newStatus: string) => {
        try {
            await api.patch(`/admin/evaluation-periods/${period.id}`, { status: newStatus });
            fetchAll();
        } catch {
            alert('Failed to update status.');
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Period Name',
            render: (item: EvaluationPeriod) => (
                <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.academic_year?.name} · {item.semester?.name}</p>
                </div>
            ),
        },
        {
            key: 'dates',
            label: 'Duration',
            render: (item: EvaluationPeriod) => (
                <span className="text-sm text-gray-500">
                    {new Date(item.start_date).toLocaleDateString()} — {new Date(item.end_date).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (item: EvaluationPeriod) => (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.status}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (item: EvaluationPeriod) => (
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => openEdit(item)} className="text-sm text-indigo-600 hover:text-indigo-800 transition">Edit</button>
                    {item.status === 'draft' && (
                        <button onClick={() => handleStatusChange(item, 'open')} className="text-sm text-green-600 hover:text-green-800 transition">Open</button>
                    )}
                    {item.status === 'open' && (
                        <button onClick={() => handleStatusChange(item, 'closed')} className="text-sm text-orange-600 hover:text-orange-800 transition">Close</button>
                    )}
                    {item.status === 'closed' && (
                        <button onClick={() => handleStatusChange(item, 'published')} className="text-sm text-blue-600 hover:text-blue-800 transition">Publish</button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="p-8">
            <PageHeader
                title="Evaluation Periods"
                description="Manage evaluation periods and their lifecycle."
                action={
                    <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                        + New Period
                    </button>
                }
            />

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <DataTable
                    columns={columns}
                    data={periods}
                    isLoading={loading}
                    emptyMessage="No evaluation periods found."
                />
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPeriod ? 'Edit Period' : 'New Evaluation Period'}>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Period Name</label>
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="First Semester Evaluation 2025-2026" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Academic Year</label>
                        <select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Select Academic Year</option>
                            {academicYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester</label>
                        <select value={form.semester_id} onChange={(e) => setForm({ ...form, semester_id: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Select Semester</option>
                            {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Evaluation Template</label>
                        <select value={form.evaluation_template_id} onChange={(e) => setForm({ ...form, evaluation_template_id: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Select Template</option>
                            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Evaluation Types</label>
                        {[
                            { key: 'allow_student_evaluation', label: 'Student Evaluation' },
                            { key: 'allow_peer_evaluation', label: 'Peer Evaluation' },
                            { key: 'allow_supervisor_evaluation', label: 'Supervisor Evaluation' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={item.key}
                                    checked={form[item.key as keyof typeof form] as boolean}
                                    onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                                    className="rounded border-gray-300 text-indigo-600"
                                />
                                <label htmlFor={item.key} className="text-sm text-gray-700">{item.label}</label>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-50">
                            {saving ? 'Saving...' : editingPeriod ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}