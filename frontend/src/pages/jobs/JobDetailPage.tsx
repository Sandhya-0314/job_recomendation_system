import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';
import { applicationService } from '@/services/applicationService';
import type { Job } from '@/types';
import {
    MapPin, Briefcase, DollarSign, Clock, Bookmark, BookmarkCheck,
    CheckCircle, AlertTriangle, ChevronLeft, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [saving, setSaving] = useState(false);
    const [applied, setApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (!id || !user) return;
        const fetchData = async () => {
            try {
                const [jobRes, savedRes, appsRes] = await Promise.all([
                    jobService.getJobById(parseInt(id)),
                    applicationService.getSavedJobs(user.id),
                    applicationService.getUserApplications(user.id),
                ]);
                setJob(jobRes);
                setIsSaved(savedRes.some((j) => j.id === parseInt(id)));
                setApplied(appsRes.some((a) => a.job?.id === parseInt(id)));
            } catch {
                toast.error('Job not found');
                navigate('/jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user, navigate]);

    const handleApply = async () => {
        if (!job) return;
        setApplying(true);
        try {
            const res = await applicationService.applyForJob(job.id);
            setApplied(true);
            toast.success(res.message);
        } catch {
            toast.error('Failed to apply. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    const handleSave = async () => {
        if (!job) return;
        setSaving(true);
        try {
            const res = await applicationService.toggleSaveJob(job.id);
            setIsSaved(res.bookmarked);
            toast.success(res.message);
        } catch {
            toast.error('Failed to save job');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <DashboardLayout><LoadingSpinner text="Loading job details..." /></DashboardLayout>;
    if (!job) return null;

    return (
        <DashboardLayout>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Jobs
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6 animate-slide-up">
                    {/* Header Card */}
                    <div className="card">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-800 to-primary-900 rounded-2xl flex items-center justify-center text-2xl font-black text-primary-300 border border-primary-700/30 flex-shrink-0">
                                {job.company.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
                                <p className="text-gray-400 font-medium">{job.company}</p>
                                <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-400">
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
                                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{job.experience_level}+ years exp.</span>
                                    {job.salary && <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" />${(job.salary / 1000).toFixed(0)}K/yr</span>}
                                    {job.posted_date && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />
                                        {new Date(job.posted_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>}
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <span className={`badge ${job.type === 'Remote' ? 'badge-success' : job.type === 'Hybrid' ? 'badge-warning' : 'badge-info'}`}>
                                        {job.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-white mb-4">Job Description</h2>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">{job.description}</p>
                    </div>

                    {/* Requirements */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-white mb-4">Required Skills & Technologies</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.requirements.map((req) => (
                                <span key={req} className="badge-primary text-sm">{req}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Apply Card */}
                    <div className="card sticky top-4">
                        <h3 className="font-semibold text-white mb-4">Ready to Apply?</h3>

                        {applied ? (
                            <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/40 rounded-xl px-4 py-3 text-emerald-300 text-sm mb-4">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                Application submitted!
                            </div>
                        ) : (
                            <button onClick={handleApply} disabled={applying} className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
                                {applying ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying...</>
                                ) : 'Apply Now'}
                            </button>
                        )}

                        <button onClick={handleSave} disabled={saving} className="btn-secondary w-full flex items-center justify-center gap-2">
                            {isSaved ? (
                                <><BookmarkCheck className="w-4 h-4" /> Saved</>
                            ) : (
                                <><Bookmark className="w-4 h-4" /> Save Job</>
                            )}
                        </button>

                        {/* Job Details */}
                        <div className="mt-6 space-y-3 border-t border-white/5 pt-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Experience</span>
                                <span className="text-white">{job.experience_level}+ years</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Work Type</span>
                                <span className="text-white">{job.type}</span>
                            </div>
                            {job.salary && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Salary</span>
                                    <span className="text-white">${job.salary.toLocaleString()}/yr</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Skills Required</span>
                                <span className="text-white">{job.requirements.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="card">
                        <div className="flex items-center gap-2 text-amber-300 mb-3">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">Application Tips</span>
                        </div>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0" />Tailor your resume to match the required skills above.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0" />Highlight experience relevant to {job.experience_level}+ years required.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0" />Research {job.company} before your interview.</li>
                        </ul>
                    </div>

                    <div className="card flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm text-white font-medium">{job.company}</p>
                            <p className="text-xs text-gray-500">Hiring at this company</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
