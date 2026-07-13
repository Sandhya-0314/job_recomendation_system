import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterPayload) => Promise<void>;
    logout: () => void;
}

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    title?: string;
    skills: string[];
    experience_years: number;
    role?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser) as AuthUser);
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await authService.login({ email, password });
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.access_token);
        setUser(response.user);
    }, []);

    const register = useCallback(async (data: RegisterPayload) => {
        await authService.register(data);
        // After register, auto-login
        await authService.login({ email: data.email, password: data.password }).then((response) => {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setToken(response.access_token);
            setUser(response.user);
        });
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        setToken(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
