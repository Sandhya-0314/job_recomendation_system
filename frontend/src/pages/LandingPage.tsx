import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Briefcase, Sparkles, Shield, TrendingUp, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: Sparkles, title: 'AI-Powered Matching',
            desc: 'Our AI analyzes your skills and experience to find perfect job matches with match scores.',
            color: 'from-primary-600 to-primary-700',
        },
        {
            icon: TrendingUp, title: 'Career Recommendations',
            desc: 'Get personalized job recommendations with matched skills, missing skills, and insights.',
            color: 'from-accent-600 to-accent-700',
        },
        {
            icon: Shield, title: 'Resume Analysis',
            desc: 'Upload your resume and let our AI extract skills and compare to job requirements.',
            color: 'from-emerald-600 to-emerald-700',
        },
        {
            icon: Users, title: 'Application Tracking',
            desc: 'Track all your applications from Applied → Interviewing → Offered in one dashboard.',
            color: 'from-amber-500 to-amber-600',
        },
    ];

    const stats = [
        { label: 'Active Job Listings', value: '1,200+' },
        { label: 'Successful Placements', value: '8,400+' },
        { label: 'AI Match Accuracy', value: '92%' },
        { label: 'Registered Users', value: '25K+' },
    ];

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 hero-gradient">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                </div>

                <div className="relative text-center max-w-4xl mx-auto animate-slide-up">
                    <div className="inline-flex items-center gap-2 bg-primary-900/40 border border-primary-700/40 rounded-full px-4 py-2 text-sm text-primary-300 mb-8">
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Job Recommendations
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-black text-white leading-tight mb-6 text-balance">
                        Find Your{' '}
                        <span className="gradient-text">Dream Job</span>{' '}
                        with AI
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Upload your resume, set your preferences, and let our AI match you with the best opportunities — with real match scores and career insights.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-base px-8 py-3.5 justify-center">
                                Go to Dashboard <ArrowRight className="w-5 h-5" />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3.5 justify-center">
                                    Get Started Free <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5 justify-center">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10">
                        {['No credit card required', 'Free to use', 'AI-powered matching'].map((item) => (
                            <div key={item} className="flex items-center gap-1.5 text-sm text-gray-500">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 border-y border-white/5">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-3xl sm:text-4xl font-black gradient-text mb-1">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Everything you need to land your next role</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Powered by artificial intelligence to give you a competitive edge in the job market.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.title} className="card-hover group">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 px-4 bg-gradient-to-b from-transparent to-gray-900/50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">How it works</h2>
                    <p className="text-gray-400 mb-16">Three simple steps to your next opportunity</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Create Profile', desc: 'Sign up and fill in your skills, experience, and job preferences.' },
                            { step: '02', title: 'Upload Resume', desc: 'Upload your PDF/DOCX resume. Our AI extracts skills and details automatically.' },
                            { step: '03', title: 'Get Matched', desc: 'Receive AI-powered job recommendations sorted by match percentage.' },
                        ].map((item) => (
                            <div key={item.step} className="card text-center">
                                <span className="text-5xl font-black gradient-text opacity-50">{item.step}</span>
                                <h3 className="text-white font-semibold text-lg mt-2 mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl mb-6 shadow-lg shadow-primary-600/30">
                        <Star className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Ready to find your dream job?</h2>
                    <p className="text-gray-400 mb-8">Join thousands of professionals who found their perfect role using JobSphere.</p>
                    <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2">
                        {isAuthenticated ? 'Go to Dashboard' : 'Start for Free'} <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
