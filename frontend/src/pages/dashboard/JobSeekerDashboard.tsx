import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import JobCard from '@/components/jobs/JobCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';
import { applicationService } from '@/services/applicationService';
import { recommendationService } from '@/services/recommendationService';
import type { Job, Application, Recommendation } from '@/types';
import { Briefcase, BookmarkCheck, FileText, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobSeekerDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [savedJobs, setSavedJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [jobsRes, appsRes, recsRes, savedRes] = await Promise.all([
                    jobService.getAllJobs(),
                    applicationService.getUserApplications(user.id),
                    recommendationService.getRecommendations(user.id),
                    applicationService.getSavedJobs(user.id),
                ]);
                setJobs(jobsRes);
                setApplications(appsRes);
                setRecommendations(recsRes);
                setSavedJobs(savedRes);
            } catch {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const statusColors: Record<string, string> = {
        Applied: 'badge-info',
        Interviewing: 'badge-warning',
        Offered: 'badge-success',
        Rejected: 'badge-danger',
    };

    if (loading) return <DashboardLayout><LoadingSpinner text="Loading dashboard..." /></DashboardLayout>;

    const topRecs = recommendations.slice(0, 3);
    const recentJobs = jobs.slice(0, 4);

    return (
        <DashboardLayout>
            {/* Welcome */}
            <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-black text-white mb-1">
                    Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-gray-400">Here's what's happening with your job search today.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Jobs" value={jobs.length} icon={Briefcase} color="primary" />
                <StatCard label="Applications" value={applications.length} icon={FileText} color="emerald" />
                <StatCard label="Saved Jobs" value={savedJobs.length} icon={BookmarkCheck} color="purple" />
                <StatCard label="AI Matches" value={recommendations.length} icon={Sparkles} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Recommendations */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="section-title">AI Recommendations</h2>
                            <p className="section-subtitle">Personalized for your profile</p>
                        </div>
                        <Link to="/recommendations" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {topRecs.length === 0 ? (
                        <div className="card text-center py-10">
                            <Sparkles className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Complete your profile to get AI recommendations</p>
                            <Link to="/profile" className="btn-primary mt-4 inline-block text-sm">Update Profile</Link>
                        </div>
                    ) : (
                        topRecs.map((rec) => (
                            <JobCard key={rec.job.id} job={rec.job} matchScore={rec.match_score} />
                        ))
                    )}
                </div>

                {/* Sidebar: Applications + Recent */}
                <div className="space-y-6">
                    {/* Application status */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="section-title text-lg">Applications</h2>
                            <Link to="/applications" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                                All <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        {applications.length === 0 ? (
                            <div className="card text-center py-8">
                                <FileText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                <p className="text-gray-500 text-xs">No applications yet</p>
                                <Link to="/jobs" className="text-primary-400 hover:text-primary-300 text-xs mt-2 inline-block">Browse Jobs</Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {applications.slice(0, 4).map((app) => (
                                    <div key={app.id} className="card p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary-900/40 rounded-lg flex items-center justify-center text-xs font-bold text-primary-300 flex-shrink-0">
                                            {app.job?.company?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium truncate">{app.job?.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{app.job?.company}</p>
                                        </div>
                                        <span className={`${statusColors[app.status] || 'badge-info'} text-xs`}>{app.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Jobs */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="section-title text-lg">Recent Jobs</h2>
                            <Link to="/jobs" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                                All <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {recentJobs.map((job) => (
                                <Link key={job.id} to={`/jobs/${job.id}`} className="card p-3 flex items-center gap-3 hover:border-primary-500/30 transition-colors">
                                    <div className="w-8 h-8 bg-primary-900/40 rounded-lg flex items-center justify-center text-xs font-bold text-primary-300 flex-shrink-0">
                                        {job.company.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate">{job.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{job.company}</p>
                                    </div>
                                    <TrendingUp className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
