import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) {
            setError('Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back! 🎉');
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? err.message
                : (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Invalid credentials';
            setError(msg);
            toast.error('Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl gradient-text">JobSphere</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
                    <p className="text-gray-400">Sign in to your account to continue</p>
                </div>

                {/* Card */}
                <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-2xl">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-3 mb-6 text-sm text-red-300">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="you@example.com"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Your password"
                                    className="input-field pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                                Create account
                            </Link>
                        </p>
                    </div>

                    {/* Demo hint */}
                    <div className="mt-4 p-3 bg-white/3 rounded-xl border border-white/5 text-center">
                        <p className="text-xs text-gray-500">
                            Demo: <span className="text-gray-400 font-mono">chaithanya@example.com</span> / <span className="text-gray-400 font-mono">password123</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
