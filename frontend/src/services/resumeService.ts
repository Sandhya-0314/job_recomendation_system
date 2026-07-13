import api from './api';
import type { ParsedResume, ResumeComparison } from '@/types';

export const resumeService = {
    async parseResume(file: File): Promise<ParsedResume> {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<ParsedResume>('/api/resume/parse', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    async compareToJob(
        jobId: number,
        skills: string[],
        experience_years: number
    ): Promise<ResumeComparison> {
        const { data } = await api.post<ResumeComparison>(`/api/resume/compare/${jobId}`, {
            skills,
            experience_years,
        });
        return data;
    },
};
