import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Eye, EyeOff, Mail, Lock, User, Code, Briefcase as BriefcaseIcon, AlertCircle, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        title: '',
        experience_years: 0,
        role: 'user',
    });
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
        }
        setSkillInput('');
    };

    const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setIsLoading(true);
        try {
            await register({
                name: form.name,
                email: form.email,
                password: form.password,
                title: form.title || undefined,
                skills,
                experience_years: form.experience_years,
                role: form.role,
            });
            toast.success('Account created successfully! 🎉');
            navigate(form.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed. Please try again.';
            setError(msg);
            toast.error('Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 py-10">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg animate-slide-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl gradient-text">JobSphere</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
                    <p className="text-gray-400">Join thousands finding their dream jobs</p>
                </div>

                <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-2xl">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-3 mb-6 text-sm text-red-300">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Row: Name & Title */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="John Doe" className="input-field pl-10" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Title</label>
                                <div className="relative">
                                    <BriefcaseIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g. Frontend Developer" className="input-field pl-10" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="you@example.com" className="input-field pl-10" required />
                            </div>
                        </div>

                        {/* Row: Password & Confirm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type={showPassword ? 'text' : 'password'} value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Min. 6 characters" className="input-field pl-10 pr-10" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="password" value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        placeholder="Confirm password" className="input-field pl-10" required />
                                </div>
                            </div>
                        </div>

                        {/* Row: Experience & Role */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Years of Experience</label>
                                <input type="number" min="0" max="40" value={form.experience_years}
                                    onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })}
                                    className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Account Type</label>
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="input-field">
                                    <option value="user">Job Seeker</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Skills</label>
                            <div className="flex gap-2 mb-2">
                                <div className="relative flex-1">
                                    <Code className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                        placeholder="e.g. Python, React..." className="input-field pl-10" />
                                </div>
                                <button type="button" onClick={addSkill} className="btn-secondary px-4 flex-shrink-0">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span key={skill} className="badge-primary flex items-center gap-1">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                            {isLoading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
