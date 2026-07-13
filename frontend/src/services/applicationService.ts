import api from './api';
import type { Application, Job, AdminApplication } from '@/types';

export const applicationService = {
    async getUserApplications(userId: number): Promise<Application[]> {
        const { data } = await api.get<Application[]>(`/api/users/${userId}/applications`);
        return data;
    },

    async applyForJob(jobId: number): Promise<{ applied: boolean; message: string; status: string }> {
        const { data } = await api.post(`/api/jobs/${jobId}/apply`);
        return data;
    },

    async getSavedJobs(userId: number): Promise<Job[]> {
        const { data } = await api.get<Job[]>(`/api/users/${userId}/bookmarks`);
        return data;
    },

    async toggleSaveJob(jobId: number): Promise<{ bookmarked: boolean; message: string }> {
        const { data } = await api.post(`/api/jobs/${jobId}/bookmark`);
        return data;
    },

    // Admin only
    async getAllApplications(): Promise<AdminApplication[]> {
        const { data } = await api.get<AdminApplication[]>('/api/applications');
        return data;
    },

    async updateApplicationStatus(
        appId: number,
        status: string
    ): Promise<{ success: boolean; status: string; message: string }> {
        const { data } = await api.patch(`/api/applications/${appId}/status`, { status });
        return data;
    },
};
