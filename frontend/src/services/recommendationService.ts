import api from './api';
import type { Recommendation } from '@/types';

export const recommendationService = {
    async getRecommendations(userId: number): Promise<Recommendation[]> {
        const { data } = await api.get<Recommendation[]>(`/api/users/${userId}/recommendations`);
        return data;
    },
};
