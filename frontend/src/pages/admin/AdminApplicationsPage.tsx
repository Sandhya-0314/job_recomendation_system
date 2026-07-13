import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import SearchBar from '@/components/ui/SearchBar';
import type { AdminApplication } from '@/types';
import { applicationService } from '@/services/applicationService';
import { FileText, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['Applied', 'Interviewing', 'Offered', 'Rejected'];

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<AdminApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        applicationService.getAllApplications()
            .then(setApplications)
            .catch(() => toast.error('Failed to load applications'))
            .finally(() => setLoading(false));
    }, []);

    const handleStatusChange = async (appId: number, newStatus: string) => {
        setUpdatingId(appId);
        try {
            await applicationService.updateApplicationStatus(appId, newStatus);
            setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus as AdminApplication['status'] } : a));
            toast.success('Status updated');
        } catch {
            toast.error('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = applications.filter((a) => {
        const q = search.toLowerCase();
        return !q || a.user?.name?.toLowerCase().includes(q) || a.job?.title?.toLowerCase().includes(q) || a.job?.company?.toLowerCase().includes(q);
    });

    if (loading) return <DashboardLayout><LoadingSpinner text="Loading applications..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="mb-6 animate-slide-up">
                <h1 className="section-title text-3xl">All Applications</h1>
                <p className="section-subtitle">{applications.length} total applications</p>
            </div>

            <div className="mb-4">
                <SearchBar value={search} onChange={setSearch} placeholder="Search by applicant, job, or company..." />
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon={FileText} title="No applications found" description="No applications match your search criteria." />
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="table-header">Applicant</th>
                                    <th className="table-header">Job</th>
                                    <th className="table-header">Match Score</th>
                                    <th className="table-header">Status</th>
                                    <th className="table-header">Applied</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((app) => (
                                    <tr key={app.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-primary-900/40 rounded-lg flex items-center justify-center text-xs font-bold text-primary-300">
                                                    {app.user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{app.user?.name}</p>
                                                    <p className="text-gray-500 text-xs">{app.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <p className="text-white text-sm">{app.job?.title}</p>
                                            <p className="text-gray-500 text-xs">{app.job?.company}</p>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`text-sm font-semibold ${app.match_score >= 70 ? 'text-emerald-400'
                                                : app.match_score >= 40 ? 'text-amber-400' : 'text-red-400'
                                                }`}>
                                                {app.match_score.toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <div className="relative">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                    disabled={updatingId === app.id}
                                                    className={`appearance-none pr-7 pl-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${app.status === 'Offered' ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/30'
                                                        : app.status === 'Interviewing' ? 'bg-amber-900/40 text-amber-300 border-amber-700/30'
                                                            : app.status === 'Rejected' ? 'bg-red-900/40 text-red-300 border-red-700/30'
                                                                : 'bg-blue-900/40 text-blue-300 border-blue-700/30'
                                                        } ${updatingId === app.id ? 'opacity-50' : ''}`}
                                                >
                                                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <ChevronDown className="w-3.5 h-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                                            </div>
                                        </td>
                                        <td className="table-cell text-gray-500 text-xs">
                                            {new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
