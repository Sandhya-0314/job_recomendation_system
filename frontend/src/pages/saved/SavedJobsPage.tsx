import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import JobCard from '@/components/jobs/JobCard';
import { useAuth } from '@/context/AuthContext';
import { applicationService } from '@/services/applicationService';
import type { Job } from '@/types';
import { BookmarkCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SavedJobsPage() {
    const { user } = useAuth();
    const [savedJobs, setSavedJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        applicationService.getSavedJobs(user.id)
            .then(setSavedJobs)
            .catch(() => toast.error('Failed to load saved jobs'))
            .finally(() => setLoading(false));
    }, [user]);

    const handleSaveToggle = async (jobId: number) => {
        try {
            await applicationService.toggleSaveJob(jobId);
            setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
            toast.success('Job removed from saved');
        } catch {
            toast.error('Failed to update saved jobs');
        }
    };

    if (loading) return <DashboardLayout><LoadingSpinner text="Loading saved jobs..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="mb-6 animate-slide-up">
                <h1 className="section-title text-3xl">Saved Jobs</h1>
                <p className="section-subtitle">{savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved</p>
            </div>

            {savedJobs.length === 0 ? (
                <EmptyState
                    icon={BookmarkCheck}
                    title="No saved jobs yet"
                    description="Save jobs you're interested in to review and apply later."
                    action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedJobs.map((job) => (
                        <JobCard key={job.id} job={job} isSaved onSaveToggle={handleSaveToggle} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
