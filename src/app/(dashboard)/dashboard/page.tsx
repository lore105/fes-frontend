'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        // Redirect based on role
        const role = user.roles[0];

        switch (role) {
            case 'super_admin':
            case 'administrator':
                router.push('/dashboard/admin');
                break;
            case 'faculty':
                router.push('/dashboard/faculty');
                break;
            case 'student':
                router.push('/dashboard/student');
                break;
            case 'dean':
            case 'department_chair':
                router.push('/dashboard/department');
                break;
            default:
                router.push('/login');
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}