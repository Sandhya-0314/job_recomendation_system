import api from './api';
import type { AuthResponse, LoginCredentials, RegisterData } from '@/types';

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>('/api/auth/login', credentials);
        return data;
    },

    async register(userData: RegisterData): Promise<AuthResponse> {
        const { data } = await api.post('/api/auth/signup', userData);
        return data;
    },

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    },
};
