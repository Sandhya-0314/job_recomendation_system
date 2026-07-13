import api from './api';
import type { Job, JobCreateData } from '@/types';

export const jobService = {
    async getAllJobs(): Promise<Job[]> {
        const { data } = await api.get<Job[]>('/api/jobs');
        return data;
    },

    async getJobById(jobId: number): Promise<Job> {
        const { data } = await api.get<Job>(`/api/jobs/${jobId}`);
        return data;
    },

    async createJob(jobData: JobCreateData): Promise<Job> {
        const { data } = await api.post<Job>('/api/jobs', jobData);
        return data;
    },
};
