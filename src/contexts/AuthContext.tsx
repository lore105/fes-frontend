'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = Cookies.get('fes_token');
        if (savedToken) {
            setToken(savedToken);
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.data.user);
        } catch {
            Cookies.remove('fes_token');
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data.data;

        Cookies.set('fes_token', token, { expires: 1 });
        setToken(token);
        setUser(user);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            Cookies.remove('fes_token');
            setToken(null);
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isLoading,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}