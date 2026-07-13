import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { jobService } from '@/services/jobService';
import { applicationService } from '@/services/applicationService';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import type { AdminApplication } from '@/types';
import { Users, Briefcase, FileText, TrendingUp, CheckCircle } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
    Applied: '#3b82f6',
    Interviewing: '#f59e0b',
    Offered: '#10b981',
    Rejected: '#ef4444',
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const [loadingApps, setLoadingApps] = useState(true);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [applications, setApplications] = useState<AdminApplication[]>([]);
    const [jobCount, setJobCount] = useState(0);

    useEffect(() => {
        applicationService.getAllApplications()
            .then(setApplications)
            .catch(() => toast.error('Failed to load applications'))
            .finally(() => setLoadingApps(false));
        jobService.getAllJobs()
            .then((j) => setJobCount(j.length))
            .catch(() => { })
            .finally(() => setLoadingJobs(false));
    }, []);

    const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const avgMatch = applications.length
        ? (applications.reduce((sum, a) => sum + a.match_score, 0) / applications.length).toFixed(1)
        : '0';

    // Group by job for bar chart
    const jobAppMap: Record<string, number> = {};
    applications.forEach((a) => { const t = a.job?.title || 'Unknown'; jobAppMap[t] = (jobAppMap[t] || 0) + 1; });
    const barData = Object.entries(jobAppMap).map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, count })).sort((a, b) => b.count - a.count).slice(0, 6);

    const isLoading = loadingApps || loadingJobs;
    if (isLoading) return <DashboardLayout><LoadingSpinner text="Loading admin data..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="mb-6 animate-slide-up">
                <h1 className="section-title text-3xl">Admin Dashboard</h1>
                <p className="section-subtitle">Platform overview and analytics</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Applications" value={applications.length} icon={FileText} color="primary" />
                <StatCard label="Total Jobs" value={jobCount} icon={Briefcase} color="emerald" />
                <StatCard label="Avg Match Score" value={`${avgMatch}%`} icon={TrendingUp} color="amber" />
                <StatCard label="Unique Users" value={new Set(applications.map((a) => a.user?.id)).size} icon={Users} color="purple" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Bar Chart */}
                <div className="card">
                    <h2 className="font-semibold text-white mb-4">Applications per Job</h2>
                    {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={barData}>
                                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 text-sm text-center py-10">No data</p>}
                </div>

                {/* Pie Chart */}
                <div className="card">
                    <h2 className="font-semibold text-white mb-4">Application Status Breakdown</h2>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                    {pieData.map((entry) => (
                                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                                <Legend formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 text-sm text-center py-10">No data</p>}
                </div>
            </div>

            {/* Recent Applications */}
            <div className="card">
                <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary-400" />
                    Recent Applications
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="table-header">Applicant</th>
                                <th className="table-header">Job</th>
                                <th className="table-header">Match</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.slice(0, 8).map((app) => (
                                <tr key={app.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                                    <td className="table-cell">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-primary-900/40 rounded-lg flex items-center justify-center text-xs font-bold text-primary-300">
                                                {app.user?.name?.charAt(0)}
                                            </div>
                                            <span className="text-white text-sm">{app.user?.name}</span>
                                        </div>
                                    </td>
                                    <td className="table-cell text-gray-300">{app.job?.title}</td>
                                    <td className="table-cell">
                                        <span className={`text-sm font-medium ${app.match_score >= 70 ? 'text-emerald-400' : app.match_score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {app.match_score.toFixed(0)}%
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        <span className={`badge ${app.status === 'Offered' ? 'badge-success'
                                                : app.status === 'Interviewing' ? 'badge-warning'
                                                    : app.status === 'Rejected' ? 'badge-danger' : 'badge-info'
                                            }`}>{app.status}</span>
                                    </td>
                                    <td className="table-cell text-gray-500">
                                        {new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {applications.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-8">No applications yet</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
