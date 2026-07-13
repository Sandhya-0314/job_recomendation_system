import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { recommendationService } from '@/services/recommendationService';
import { applicationService } from '@/services/applicationService';
import type { Recommendation } from '@/types';
import { Sparkles, CheckCircle, XCircle, TrendingUp, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function RecommendationsPage() {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<number | null>(null);
    const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [recsRes, appsRes] = await Promise.all([
                    recommendationService.getRecommendations(user.id),
                    applicationService.getUserApplications(user.id),
                ]);
                setRecommendations(recsRes);
                setAppliedIds(new Set(appsRes.map((a) => a.job?.id).filter(Boolean)));
            } catch {
                toast.error('Failed to load recommendations');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleApply = async (jobId: number) => {
        setApplying(jobId);
        try {
            const res = await applicationService.applyForJob(jobId);
            setAppliedIds((prev) => new Set([...prev, jobId]));
            toast.success(res.message);
        } catch {
            toast.error('Failed to apply');
        } finally {
            setApplying(null);
        }
    };

    const getStrengthColor = (score: number) => {
        if (score >= 70) return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Strong Match' };
        if (score >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500', label: 'Medium Match' };
        return { text: 'text-red-400', bg: 'bg-red-500', label: 'Low Match' };
    };

    if (loading) return <DashboardLayout><LoadingSpinner text="Generating recommendations..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="mb-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-1">
                    <Sparkles className="w-6 h-6 text-primary-400" />
                    <h1 className="section-title text-3xl">AI Recommendations</h1>
                </div>
                <p className="section-subtitle">{recommendations.length} personalized matches based on your profile</p>
            </div>

            {recommendations.length === 0 ? (
                <EmptyState
                    icon={Sparkles}
                    title="No recommendations yet"
                    description="Update your profile with skills and experience to get personalized AI job recommendations."
                    action={<Link to="/profile" className="btn-primary">Update Profile</Link>}
                />
            ) : (
                <div className="space-y-4">
                    {recommendations.map((rec, idx) => {
                        const strength = getStrengthColor(rec.match_score);
                        const isApplied = appliedIds.has(rec.job.id);
                        return (
                            <div key={rec.job.id} className="card-hover animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    {/* Job Info */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-800 to-primary-900 rounded-xl flex items-center justify-center text-lg font-black text-primary-300 flex-shrink-0 border border-primary-700/30">
                                        {rec.job.company.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-white text-lg">{rec.job.title}</h3>
                                                <p className="text-gray-400 text-sm">{rec.job.company} · {rec.job.location}</p>
                                            </div>
                                            {/* Match Score Dial */}
                                            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                                                <div className={`text-2xl font-black ${strength.text}`}>{rec.match_score.toFixed(0)}%</div>
                                                <div className={`text-xs font-medium ${strength.text}`}>{strength.label}</div>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-3 mb-4">
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${strength.bg} rounded-full transition-all duration-700`}
                                                    style={{ width: `${rec.match_score}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Skills breakdown */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            {rec.matched_skills.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Matched Skills
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {rec.matched_skills.map((skill) => (
                                                            <span key={skill} className="badge bg-emerald-900/40 text-emerald-300 border border-emerald-700/30">{skill}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {rec.missing_skills.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                                                        <XCircle className="w-3.5 h-3.5" /> Missing Skills
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {rec.missing_skills.map((skill) => (
                                                            <span key={skill} className="badge bg-red-900/40 text-red-300 border border-red-700/30">{skill}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Experience & Breakdown */}
                                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                {rec.experience_status}
                                            </span>
                                            {rec.breakdown && (
                                                <>
                                                    <span>Skill: {rec.breakdown.skill_match?.score?.toFixed(0) ?? 0}%</span>
                                                    <span>Exp: {rec.breakdown.experience_match?.score?.toFixed(0) ?? 0}%</span>
                                                    <span>Pref: {rec.breakdown.preference_match?.score?.toFixed(0) ?? 0}%</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            {isApplied ? (
                                                <span className="badge-success flex items-center gap-1 text-sm">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Applied
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleApply(rec.job.id)}
                                                    disabled={applying === rec.job.id}
                                                    className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                                                >
                                                    {applying === rec.job.id ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : null}
                                                    Quick Apply
                                                </button>
                                            )}
                                            <Link to={`/jobs/${rec.job.id}`} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                                                <LinkIcon className="w-3.5 h-3.5" /> View Job <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}
