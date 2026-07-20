'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

interface College {
    id: number;
    name: string;
    code: string;
    description: string;
    is_active: boolean;
    departments_count?: number;
}

interface FormData {
    name: string;
    code: string;
    description: string;
    is_active: boolean;
}

const defaultForm: FormData = {
    name: '',
    code: '',
    description: '',
    is_active: true,
};

export default function AcademicStructurePage() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCollege, setEditingCollege] = useState<College | null>(null);
    const [form, setForm] = useState<FormData>(defaultForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [departments, setDepartments] = useState<any[]>([]);
    const [deptModalOpen, setDeptModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<any>(null);
    const [deptForm, setDeptForm] = useState({
        college_id: '',
        name: '',
        code: '',
        description: '',
        is_active: true,
    });
    const [deptSaving, setDeptSaving] = useState(false);
    const [deptError, setDeptError] = useState('');

    useEffect(() => {
        fetchColleges();
        fetchDepartments();
    }, []);

    const fetchColleges = async () => {
        try {
            const response = await api.get('/admin/colleges');
            setColleges(response.data.data);
        } catch (error) {
            console.error('Failed to fetch colleges:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/admin/departments');
            setDepartments(response.data.data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    };

    const openCreate = () => {
        setEditingCollege(null);
        setForm(defaultForm);
        setError('');
        setModalOpen(true);
    };

    const openEdit = (college: College) => {
        setEditingCollege(college);
        setForm({
            name: college.name,
            code: college.code,
            description: college.description ?? '',
            is_active: college.is_active,
        });
        setError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            if (editingCollege) {
                await api.put(`/admin/colleges/${editingCollege.id}`, form);
            } else {
                await api.post('/admin/colleges', form);
            }
            setModalOpen(false);
            fetchColleges();
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (college: College) => {
        if (!confirm(`Delete ${college.name}?`)) return;
        try {
            await api.delete(`/admin/colleges/${college.id}`);
            fetchColleges();
        } catch {
            alert('Failed to delete college.');
        }
    };

    const openCreateDept = () => {
        setEditingDept(null);
        setDeptForm({ college_id: '', name: '', code: '', description: '', is_active: true });
        setDeptError('');
        setDeptModalOpen(true);
    };

    const openEditDept = (dept: any) => {
        setEditingDept(dept);
        setDeptForm({
            college_id: dept.college_id,
            name: dept.name,
            code: dept.code,
            description: dept.description ?? '',
            is_active: dept.is_active,
        });
        setDeptError('');
        setDeptModalOpen(true);
    };

    const handleDeptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeptSaving(true);
        setDeptError('');
        try {
            if (editingDept) {
                await api.put(`/admin/departments/${editingDept.id}`, deptForm);
            } else {
                await api.post('/admin/departments', deptForm);
            }
            setDeptModalOpen(false);
            fetchDepartments();
        } catch (err: any) {
            setDeptError(err.response?.data?.message ?? 'Something went wrong.');
        } finally {
            setDeptSaving(false);
        }
    };

    const handleDeleteDept = async (dept: any) => {
        if (!confirm(`Delete ${dept.name}?`)) return;
        try {
            await api.delete(`/admin/departments/${dept.id}`);
            fetchDepartments();
        } catch {
            alert('Failed to delete department.');
        }
    };

    const columns = [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'College Name' },
        {
            key: 'departments_count',
            label: 'Departments',
            render: (item: College) => (
                <span className="text-gray-500">{item.departments_count ?? 0}</span>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (item: College) => (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (item: College) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openEdit(item)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 transition"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(item)}
                        className="text-sm text-red-500 hover:text-red-700 transition"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    const deptColumns = [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Department Name' },
        {
            key: 'college',
            label: 'College',
            render: (item: any) => (
                <span className="text-gray-500">{item.college?.name ?? 'N/A'}</span>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (item: any) => (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <button onClick={() => openEditDept(item)} className="text-sm text-indigo-600 hover:text-indigo-800 transition">Edit</button>
                    <button onClick={() => handleDeleteDept(item)} className="text-sm text-red-500 hover:text-red-700 transition">Delete</button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-8">
            <PageHeader
                title="Academic Structure"
                description="Manage colleges, departments, programs, subjects and sections."
                action={
                    <button
                        onClick={openCreate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                        + Add College
                    </button>
                }
            />

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Colleges</h2>
                <DataTable
                    columns={columns}
                    data={colleges}
                    isLoading={loading}
                    emptyMessage="No colleges found. Add your first college."
                />
            </div>

            {/* Departments Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-900">Departments</h2>
                    <button
                        onClick={openCreateDept}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                        + Add Department
                    </button>
                </div>
                <DataTable
                    columns={deptColumns}
                    data={departments}
                    emptyMessage="No departments found."
                />
            </div>

            {/* Department Modal */}
            <Modal
                isOpen={deptModalOpen}
                onClose={() => setDeptModalOpen(false)}
                title={editingDept ? 'Edit Department' : 'Add Department'}
            >
                <form onSubmit={handleDeptSubmit} className="space-y-4">
                    {deptError && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
                            {deptError}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">College</label>
                        <select
                            value={deptForm.college_id}
                            onChange={(e) => setDeptForm({ ...deptForm, college_id: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select College</option>
                            {colleges.map((college) => (
                                <option key={college.id} value={college.id}>{college.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Department Name</label>
                        <input
                            type="text"
                            value={deptForm.name}
                            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Department of Information Technology"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Code</label>
                        <input
                            type="text"
                            value={deptForm.code}
                            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="DIT"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea
                            value={deptForm.description}
                            onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="Brief description..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="dept_is_active"
                            checked={deptForm.is_active}
                            onChange={(e) => setDeptForm({ ...deptForm, is_active: e.target.checked })}
                            className="rounded border-gray-300 text-indigo-600"
                        />
                        <label htmlFor="dept_is_active" className="text-sm text-gray-700">Active</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setDeptModalOpen(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={deptSaving}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-50"
                        >
                            {deptSaving ? 'Saving...' : editingDept ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCollege ? 'Edit College' : 'Add College'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">College Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="College of Computing and Information Sciences"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Code</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="CCIS"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="Brief description..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={form.is_active}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                            className="rounded border-gray-300 text-indigo-600"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : editingCollege ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}