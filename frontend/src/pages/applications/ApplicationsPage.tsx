import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { applicationService } from '@/services/applicationService';
import type { Application } from '@/types';
import { FileText, Briefcase, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    Applied: { label: 'Applied', className: 'badge-info', icon: Clock },
    Interviewing: { label: 'Interviewing', className: 'badge-warning', icon: MessageSquare },
    Offered: { label: 'Offered', className: 'badge-success', icon: CheckCircle },
    Rejected: { label: 'Rejected', className: 'badge-danger', icon: XCircle },
};

export default function ApplicationsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        applicationService.getUserApplications(user.id)
            .then(setApplications)
            .catch(() => toast.error('Failed to load applications'))
            .finally(() => setLoading(false));
    }, [user]);

    const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    if (loading) return <DashboardLayout><LoadingSpinner text="Loading applications..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="mb-6 animate-slide-up">
                <h1 className="section-title text-3xl">My Applications</h1>
                <p className="section-subtitle">{applications.length} total application{applications.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Status summary */}
            {applications.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {Object.entries(statusConfig).map(([status, conf]) => {
                        const Icon = conf.icon;
                        return (
                            <div key={status} className="card p-4 flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">{statusCounts[status] || 0}</p>
                                    <p className="text-xs text-gray-500">{conf.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {applications.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No applications yet"
                    description="Start applying to jobs to track your application status here."
                    action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>}
                />
            ) : (
                <div className="space-y-3">
                    {applications.map((app) => {
                        const conf = statusConfig[app.status] || statusConfig.Applied;
                        const Icon = conf.icon;
                        return (
                            <div key={app.id} className="card-hover flex items-center gap-4 p-4">
                                <div className="w-11 h-11 bg-gradient-to-br from-primary-800 to-primary-900 rounded-xl flex items-center justify-center text-sm font-bold text-primary-300 flex-shrink-0">
                                    {app.job?.company?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/jobs/${app.job?.id}`} className="text-white font-semibold hover:text-primary-300 transition-colors">
                                        {app.job?.title}
                                    </Link>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{app.job?.company}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`${conf.className} flex items-center gap-1`}>
                                        <Icon className="w-3 h-3" />{app.status}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Progress legend */}
            {applications.length > 0 && (
                <div className="mt-8 card">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-primary-400" />
                        Application Pipeline
                    </h3>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {['Applied', 'Interviewing', 'Offered', 'Rejected'].map((status, idx, arr) => {
                            const conf = statusConfig[status];
                            const count = statusCounts[status] || 0;
                            return (
                                <div key={status} className="flex items-center gap-2 flex-shrink-0">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs font-bold">
                                            {count}
                                        </div>
                                        <p className={`text-xs font-medium ${conf.className.replace('badge-', 'text-')} whitespace-nowrap`}>{status}</p>
                                    </div>
                                    {idx < arr.length - 1 && <div className="w-12 h-0.5 bg-white/5 flex-shrink-0" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
