import { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { resumeService } from '@/services/resumeService';
import { jobService } from '@/services/jobService';
import type { ParsedResume, ResumeComparison, Job } from '@/types';
import { Upload, FileText, CheckCircle, XCircle, Zap, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumePage() {
    const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
    const [parsing, setParsing] = useState(false);
    const [comparison, setComparison] = useState<ResumeComparison | null>(null);
    const [comparing, setComparing] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.name.match(/\.(pdf|docx|txt)$/i)) {
            toast.error('Please upload a PDF, DOCX, or TXT file');
            return;
        }
        setFileName(file.name);
        setParsing(true);
        setComparison(null);
        try {
            const parsed = await resumeService.parseResume(file);
            setParsedResume(parsed);
            const allJobs = await jobService.getAllJobs();
            setJobs(allJobs);
            toast.success('Resume parsed successfully!');
        } catch {
            toast.error('Failed to parse resume. Please try a different file.');
        } finally {
            setParsing(false);
        }
    };

    const handleCompare = async () => {
        if (!parsedResume || !selectedJobId) return;
        setComparing(true);
        try {
            const result = await resumeService.compareToJob(selectedJobId, parsedResume.skills, parsedResume.experience_years);
            setComparison(result);
            toast.success('Comparison complete!');
        } catch {
            toast.error('Failed to compare resume to job');
        } finally {
            setComparing(false);
        }
    };

    const strengthColor = comparison?.match_strength === 'Strong' ? 'text-emerald-400 border-emerald-700/40 bg-emerald-900/20'
        : comparison?.match_strength === 'Medium' ? 'text-amber-400 border-amber-700/40 bg-amber-900/20'
            : 'text-red-400 border-red-700/40 bg-red-900/20';

    return (
        <DashboardLayout>
            <div className="mb-6 animate-slide-up">
                <h1 className="section-title text-3xl">Resume Analysis</h1>
                <p className="section-subtitle">Upload your resume to extract skills and compare to job listings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload */}
                <div className="space-y-4">
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${dragOver ? 'border-primary-500 bg-primary-900/20' : 'border-white/10 hover:border-white/20 hover:bg-white/3'
                            }`}
                    >
                        <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                        {parsing ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-primary-600/30 border-t-primary-500 rounded-full animate-spin" />
                                <p className="text-gray-400 text-sm">Parsing resume...</p>
                            </div>
                        ) : parsedResume ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 bg-emerald-900/40 rounded-2xl flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{fileName}</p>
                                    <p className="text-gray-400 text-sm">Resume parsed ✓</p>
                                    <button onClick={(e) => { e.stopPropagation(); setParsedResume(null); setComparison(null); setFileName(''); }}
                                        className="text-xs text-red-400 hover:text-red-300 mt-1 flex items-center gap-1 mx-auto">
                                        <X className="w-3 h-3" /> Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 bg-primary-900/40 rounded-2xl flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-primary-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Drop your resume here</p>
                                    <p className="text-gray-400 text-sm">or click to browse</p>
                                    <p className="text-gray-600 text-xs mt-1">PDF, DOCX, or TXT • Max 10MB</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Parsed Data Display */}
                    {parsedResume && (
                        <div className="card space-y-4 animate-fade-in">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary-400" /> Extracted Information
                            </h3>
                            {parsedResume.name && (
                                <div><p className="text-xs text-gray-500 mb-1">Name</p><p className="text-white text-sm">{parsedResume.name}</p></div>
                            )}
                            {parsedResume.email && (
                                <div><p className="text-xs text-gray-500 mb-1">Email</p><p className="text-white text-sm">{parsedResume.email}</p></div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Experience</p>
                                <p className="text-white text-sm">{parsedResume.experience_years} years</p>
                            </div>
                            {parsedResume.skills?.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Extracted Skills ({parsedResume.skills.length})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {parsedResume.skills.map((skill) => (
                                            <span key={skill} className="badge-primary">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Job Comparison */}
                <div className="space-y-4">
                    {parsedResume && (
                        <div className="card animate-fade-in">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Search className="w-4 h-4 text-primary-400" /> Compare to a Job
                            </h3>
                            <select
                                value={selectedJobId ?? ''}
                                onChange={(e) => setSelectedJobId(e.target.value ? parseInt(e.target.value) : null)}
                                className="input-field mb-4"
                            >
                                <option value="">— Select a job —</option>
                                {jobs.map((job) => (
                                    <option key={job.id} value={job.id}>{job.title} · {job.company}</option>
                                ))}
                            </select>
                            <button onClick={handleCompare} disabled={!selectedJobId || comparing} className="btn-primary w-full flex items-center justify-center gap-2">
                                {comparing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
                                {comparing ? 'Analyzing...' : 'Compare Resume'}
                            </button>
                        </div>
                    )}

                    {/* Comparison Results */}
                    {comparison && (
                        <div className="card animate-slide-up space-y-5">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary-400" /> Analysis Results
                            </h3>

                            {/* Score */}
                            <div className={`rounded-xl border p-4 text-center ${strengthColor}`}>
                                <p className="text-4xl font-black">{comparison.match_score.toFixed(0)}%</p>
                                <p className="font-semibold">{comparison.match_strength} Match</p>
                            </div>

                            {/* Progress */}
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Match Score</span>
                                    <span>{comparison.match_score.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${comparison.match_strength === 'Strong' ? 'bg-emerald-500'
                                                : comparison.match_strength === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${comparison.match_score}%` }}
                                    />
                                </div>
                            </div>

                            {/* Matched Skills */}
                            {comparison.matched_skills.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5" /> Matched Skills
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {comparison.matched_skills.map((s) => (
                                            <span key={s} className="badge bg-emerald-900/40 text-emerald-300 border border-emerald-700/30">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Missing Skills */}
                            {comparison.missing_skills.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                                        <XCircle className="w-3.5 h-3.5" /> Skills to Develop
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {comparison.missing_skills.map((s) => (
                                            <span key={s} className="badge bg-red-900/40 text-red-300 border border-red-700/30">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendation */}
                            {comparison.recommendation && (
                                <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                                    <p className="text-xs text-gray-400 leading-relaxed">{comparison.recommendation}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!parsedResume && (
                        <div className="card flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="w-10 h-10 text-gray-600 mb-3" />
                            <p className="text-gray-400 text-sm">Upload your resume to compare it against job listings</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
