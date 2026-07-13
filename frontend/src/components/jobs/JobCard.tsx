import { Link } from 'react-router-dom';
import type { Job } from '@/types';
import { MapPin, Briefcase, DollarSign, Clock, Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react';

interface JobCardProps {
    job: Job;
    isSaved?: boolean;
    onSaveToggle?: (jobId: number) => void;
    matchScore?: number;
    compact?: boolean;
}

const jobTypeBadge: Record<string, string> = {
    Remote: 'badge-success',
    Hybrid: 'badge-warning',
    Onsite: 'badge-info',
    'Full-time': 'badge-primary',
    'Part-time': 'badge-purple',
    Contract: 'badge-danger',
};

export default function JobCard({ job, isSaved, onSaveToggle, matchScore, compact = false }: JobCardProps) {
    return (
        <div className={`card-hover group relative ${compact ? 'p-4' : 'p-6'}`}>
            {/* Match Score Badge */}
            {matchScore !== undefined && (
                <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${matchScore >= 70 ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40'
                        : matchScore >= 40 ? 'bg-amber-900/60 text-amber-300 border border-amber-700/40'
                            : 'bg-red-900/60 text-red-300 border border-red-700/40'
                    }`}>
                    {matchScore.toFixed(0)}% Match
                </div>
            )}

            {/* Save button */}
            {onSaveToggle && (
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSaveToggle(job.id); }}
                    className={`absolute ${matchScore !== undefined ? 'top-10 right-4' : 'top-4 right-4'} w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isSaved
                            ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                            : 'bg-white/5 text-gray-500 hover:text-primary-400 hover:bg-primary-600/10 border border-white/5'
                        }`}
                    title={isSaved ? 'Remove from saved' : 'Save job'}
                >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
            )}

            {/* Company logo placeholder */}
            <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-800 to-primary-900 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold text-primary-300 border border-primary-700/30">
                    {job.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                    <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-1 mb-0.5">
                        {job.title}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">{job.company}</p>
                </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> {job.experience_level}+ yrs
                </span>
                {job.salary && (
                    <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" /> {(job.salary / 1000).toFixed(0)}K/yr
                    </span>
                )}
                {job.posted_date && (
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(job.posted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                )}
            </div>

            {/* Type badge */}
            <div className="flex items-center gap-2 mt-3">
                <span className={jobTypeBadge[job.type] || 'badge-primary'}>{job.type}</span>
                {matchScore !== undefined && matchScore >= 70 && (
                    <span className="badge-success">Strong Match</span>
                )}
            </div>

            {!compact && (
                <>
                    {/* Description */}
                    <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">{job.description}</p>

                    {/* Requirements */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.requirements.slice(0, 4).map((req) => (
                            <span key={req} className="badge badge-primary">{req}</span>
                        ))}
                        {job.requirements.length > 4 && (
                            <span className="text-xs text-gray-500 flex items-center">+{job.requirements.length - 4} more</span>
                        )}
                    </div>
                </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
                <Link
                    to={`/jobs/${job.id}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </div>
    );
}
