'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    employee_id?: string;
    student_id?: string;
    is_active: boolean;
    roles: Array<{ name: string }>;
}

const defaultForm = {
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    password: '',
    employee_id: '',
    student_id: '',
    phone: '',
    gender: '',
    role: '',
    is_active: true,
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter]);

    const fetchUsers = async () => {
        try {
            const params: any = {};
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            const response = await api.get('/admin/users', { params });
            setUsers(response.data.data.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingUser(null);
        setForm(defaultForm);
        setError('');
        setModalOpen(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setForm({
            first_name: user.first_name,
            last_name: user.last_name,
            middle_name: '',
            email: user.email,
            password: '',
            employee_id: user.employee_id ?? '',
            student_id: user.student_id ?? '',
            phone: '',
            gender: '',
            role: user.roles[0]?.name ?? '',
            is_active: user.is_active,
        });
        setError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload: any = { ...form };
            if (!payload.password) delete payload.password;
            if (!payload.employee_id) delete payload.employee_id;
            if (!payload.student_id) delete payload.student_id;

            if (editingUser) {
                await api.put(`/admin/users/${editingUser.id}`, payload);
            } else {
                await api.post('/admin/users', payload);
            }
            setModalOpen(false);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`Delete ${user.name}?`)) return;
        try {
            await api.delete(`/admin/users/${user.id}`);
            fetchUsers();
        } catch {
            alert('Failed to delete user.');
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Name',
            render: (item: User) => (
                <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.email}</p>
                </div>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            render: (item: User) => (
                <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                    {item.roles[0]?.name ?? 'No role'}
                </span>
            ),
        },
        {
            key: 'id_number',
            label: 'ID Number',
            render: (item: User) => (
                <span className="text-gray-500 text-xs">
                    {item.employee_id ?? item.student_id ?? '—'}
                </span>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (item: User) => (
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
            render: (item: User) => (
                <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(item)} className="text-sm text-indigo-600 hover:text-indigo-800 transition">Edit</button>
                    <button onClick={() => handleDelete(item)} className="text-sm text-red-500 hover:text-red-700 transition">Delete</button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-8">
            <PageHeader
                title="User Management"
                description="Manage students, faculty and staff accounts."
                action={
                    <button
                        onClick={openCreate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                        + Add User
                    </button>
                }
            />

            {/* Filters */}
            <div className="flex gap-3 mb-5">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Roles</option>
                    <option value="administrator">Administrator</option>
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                    <option value="dean">Dean</option>
                    <option value="department_chair">Department Chair</option>
                    <option value="registrar">Registrar</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <DataTable
                    columns={columns}
                    data={users}
                    isLoading={loading}
                    emptyMessage="No users found."
                />
            </div>

            {/* User Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingUser ? 'Edit User' : 'Add User'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                            <input
                                type="text"
                                value={form.first_name}
                                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                            <input
                                type="text"
                                value={form.last_name}
                                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password {editingUser && <span className="text-gray-400 font-normal">(leave blank to keep)</span>}
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required={!editingUser}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select Role</option>
                            <option value="administrator">Administrator</option>
                            <option value="faculty">Faculty</option>
                            <option value="student">Student</option>
                            <option value="dean">Dean</option>
                            <option value="department_chair">Department Chair</option>
                            <option value="registrar">Registrar</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID</label>
                            <input
                                type="text"
                                value={form.employee_id}
                                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="EMP-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Student ID</label>
                            <input
                                type="text"
                                value={form.student_id}
                                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="2025-0001"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                        <select
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="user_is_active"
                            checked={form.is_active}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                            className="rounded border-gray-300 text-indigo-600"
                        />
                        <label htmlFor="user_is_active" className="text-sm text-gray-700">Active</label>
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
                            {saving ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}