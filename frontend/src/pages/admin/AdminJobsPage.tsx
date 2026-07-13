import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import SearchBar from '@/components/ui/SearchBar';
import Modal from '@/components/ui/Modal';
import { jobService } from '@/services/jobService';
import type { Job, JobCreateData } from '@/types';
import { Briefcase, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = ['Remote', 'Hybrid', 'Onsite', 'Full-time', 'Part-time', 'Contract'];

const emptyForm: JobCreateData = {
    title: '', company: '', location: '', description: '',
    requirements: [], type: 'Remote', experience_level: 0, salary: 0,
};

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<JobCreateData>(emptyForm);
    const [reqInput, setReqInput] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        jobService.getAllJobs()
            .then(setJobs)
            .catch(() => toast.error('Failed to load jobs'))
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async () => {
        if (!form.title || !form.company || !form.location) {
            toast.error('Please fill in required fields (title, company, location)');
            return;
        }
        setCreating(true);
        try {
            const newJob = await jobService.createJob(form);
            setJobs((prev) => [newJob, ...prev]);
            setShowModal(false);
            setForm(emptyForm);
            toast.success('Job created successfully!');
        } catch {
            toast.error('Failed to create job');
        } finally {
            setCreating(false);
        }
    };

    const addReq = () => {
        const t = reqInput.trim();
        if (t && !form.requirements.includes(t)) setForm({ ...form, requirements: [...form.requirements, t] });
        setReqInput('');
    };

    const filtered = jobs.filter((j) => {
        const q = search.toLowerCase();
        return !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
    });

    if (loading) return <DashboardLayout><LoadingSpinner text="Loading jobs..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="mb-6 animate-slide-up flex items-center justify-between">
                <div>
                    <h1 className="section-title text-3xl">Manage Jobs</h1>
                    <p className="section-subtitle">{jobs.length} total job listings</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Post Job
                </button>
            </div>

            <div className="mb-4">
                <SearchBar value={search} onChange={setSearch} placeholder="Search jobs..." />
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon={Briefcase} title="No jobs found" description="Post the first job listing." action={<button onClick={() => setShowModal(true)} className="btn-primary">Post Job</button>} />
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="table-header">Job</th>
                                    <th className="table-header">Type</th>
                                    <th className="table-header">Location</th>
                                    <th className="table-header">Experience</th>
                                    <th className="table-header">Salary</th>
                                    <th className="table-header">Skills</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((job) => (
                                    <tr key={job.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-primary-900/40 rounded-lg flex items-center justify-center text-xs font-bold text-primary-300">
                                                    {job.company.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{job.title}</p>
                                                    <p className="text-gray-500 text-xs">{job.company}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell"><span className={`badge ${job.type === 'Remote' ? 'badge-success' : job.type === 'Hybrid' ? 'badge-warning' : 'badge-info'}`}>{job.type}</span></td>
                                        <td className="table-cell text-gray-300 text-sm">{job.location}</td>
                                        <td className="table-cell text-gray-300 text-sm">{job.experience_level}+ yrs</td>
                                        <td className="table-cell text-gray-300 text-sm">{job.salary ? `$${(job.salary / 1000).toFixed(0)}K` : '—'}</td>
                                        <td className="table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {job.requirements.slice(0, 3).map((r) => <span key={r} className="badge badge-primary text-xs">{r}</span>)}
                                                {job.requirements.length > 3 && <span className="text-gray-500 text-xs">+{job.requirements.length - 3}</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Job Modal */}
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(emptyForm); }} title="Post New Job" size="lg">
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Title *</label>
                            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Senior React Developer" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Company *</label>
                            <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" placeholder="Company name" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Location *</label>
                            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="City or Remote" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Type</label>
                            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Min. Experience (years)</label>
                            <input type="number" min="0" value={form.experience_level} onChange={(e) => setForm({ ...form, experience_level: parseInt(e.target.value) || 0 })} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Annual Salary ($)</label>
                            <input type="number" min="0" step="1000" value={form.salary} onChange={(e) => setForm({ ...form, salary: parseInt(e.target.value) || 0 })} className="input-field" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={4} placeholder="Describe the role and responsibilities..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Required Skills</label>
                        <div className="flex gap-2 mb-2">
                            <input type="text" value={reqInput} onChange={(e) => setReqInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addReq(); } }}
                                placeholder="Add skill..." className="input-field flex-1" />
                            <button type="button" onClick={addReq} className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.requirements.map((req) => (
                                <span key={req} className="badge-primary flex items-center gap-1">
                                    {req}
                                    <button onClick={() => setForm({ ...form, requirements: form.requirements.filter((r) => r !== req) })}><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleCreate} disabled={creating} className="btn-primary w-full flex items-center justify-center gap-2">
                        {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                        {creating ? 'Creating...' : 'Create Job'}
                    </button>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
