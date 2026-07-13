import api from './api';
import type { User, UserUpdateData } from '@/types';

export const userService = {
    async getProfile(userId: number): Promise<User> {
        const { data } = await api.get<User>(`/api/users/${userId}`);
        return data;
    },

    async updateProfile(userId: number, userData: UserUpdateData): Promise<User> {
        const { data } = await api.put<User>(`/api/users/${userId}`, userData);
        return data;
    },
    async getAllUsers(): Promise<User[]> {
        const { data } = await api.get<User[]>('/api/users');
        return data;
    },
};
