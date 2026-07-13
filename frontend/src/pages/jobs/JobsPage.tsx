import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import JobCard from '@/components/jobs/JobCard';
import SearchBar from '@/components/ui/SearchBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';
import { applicationService } from '@/services/applicationService';
import type { Job } from '@/types';
import { Briefcase, Filter, SortAsc, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_SIZE = 6;

export default function JobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'salary_asc' | 'salary_desc'>('recent');
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [jobsRes, savedRes] = await Promise.all([
                    jobService.getAllJobs(),
                    applicationService.getSavedJobs(user.id),
                ]);
                setJobs(jobsRes);
                setSavedJobIds(new Set(savedRes.map((j) => j.id)));
            } catch {
                toast.error('Failed to load jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleSaveToggle = async (jobId: number) => {
        try {
            const res = await applicationService.toggleSaveJob(jobId);
            setSavedJobIds((prev) => {
                const next = new Set(prev);
                if (res.bookmarked) next.add(jobId); else next.delete(jobId);
                return next;
            });
            toast.success(res.message);
        } catch {
            toast.error('Failed to update saved jobs');
        }
    };

    const filtered = useMemo(() => {
        let result = [...jobs];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((j) =>
                j.title.toLowerCase().includes(q) ||
                j.company.toLowerCase().includes(q) ||
                j.location.toLowerCase().includes(q) ||
                j.requirements.some((r) => r.toLowerCase().includes(q))
            );
        }
        if (typeFilter) result = result.filter((j) => j.type === typeFilter);
        if (sortBy === 'salary_asc') result.sort((a, b) => (a.salary || 0) - (b.salary || 0));
        else if (sortBy === 'salary_desc') result.sort((a, b) => (b.salary || 0) - (a.salary || 0));
        return result;
    }, [jobs, search, typeFilter, sortBy]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const jobTypes = ['Remote', 'Hybrid', 'Onsite', 'Full-time', 'Part-time', 'Contract'];

    if (loading) return <DashboardLayout><LoadingSpinner text="Loading jobs..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="mb-6 animate-slide-up">
                <h1 className="section-title text-3xl">Browse Jobs</h1>
                <p className="section-subtitle">{filtered.length} positions available</p>
            </div>

            {/* Search + Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <SearchBar
                    value={search}
                    onChange={(v) => { setSearch(v); setPage(1); }}
                    placeholder="Search jobs, companies, skills..."
                    className="flex-1"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-primary-500/50' : ''}`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {typeFilter && <span className="w-2 h-2 bg-primary-400 rounded-full" />}
                    </button>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="input-field py-2 w-auto text-sm"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="salary_desc">Salary: High → Low</option>
                        <option value="salary_asc">Salary: Low → High</option>
                    </select>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="card mb-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                            <SortAsc className="w-4 h-4" /> Job Type
                        </div>
                        {typeFilter && (
                            <button onClick={() => setTypeFilter('')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {jobTypes.map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTypeFilter(typeFilter === t ? '' : t); setPage(1); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === t
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Jobs Grid */}
            {paginated.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="No jobs found"
                    description="Try adjusting your search or filters to find more jobs."
                    action={<button onClick={() => { setSearch(''); setTypeFilter(''); }} className="btn-secondary">Clear Filters</button>}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginated.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                isSaved={savedJobIds.has(job.id)}
                                onSaveToggle={handleSaveToggle}
                            />
                        ))}
                    </div>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}
        </DashboardLayout>
    );
}
