import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Briefcase, Users, Sparkles, Target, Heart } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <main className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16 animate-slide-up">
                        <div className="inline-flex items-center gap-2 bg-primary-900/40 border border-primary-700/40 rounded-full px-4 py-2 text-sm text-primary-300 mb-6">
                            <Heart className="w-4 h-4" />
                            Our Story
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4">About <span className="gradient-text">JobSphere</span></h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            We're on a mission to connect talented professionals with their perfect career opportunities using the power of artificial intelligence.
                        </p>
                    </div>

                    {/* Mission cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {[
                            { icon: Target, title: 'Our Mission', desc: 'Eliminate the friction in job searching by delivering precision recommendations based on your unique profile.', color: 'from-primary-600 to-primary-700' },
                            { icon: Sparkles, title: 'Our Technology', desc: 'AI-powered content-based filtering that matches skills, experience levels, and preferences for every recommendation.', color: 'from-accent-600 to-accent-700' },
                            { icon: Users, title: 'Our Community', desc: 'Thousands of job seekers and employers trust JobSphere for transparent, data-driven hiring decisions.', color: 'from-emerald-600 to-emerald-700' },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="card-hover text-center">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Story */}
                    <div className="card mb-16">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">The Story Behind JobSphere</h2>
                                <div className="space-y-4 text-gray-400 leading-relaxed">
                                    <p>
                                        JobSphere was born from a simple frustration: the job search process is broken. Candidates spend hours applying to dozens of jobs that aren't a good fit, while employers sift through hundreds of mismatched applications.
                                    </p>
                                    <p>
                                        We built JobSphere to change that. By leveraging AI and content-based recommendation algorithms, we analyze your actual skills, experience level, and career preferences to surface jobs that genuinely fit — with transparent match scores so you know exactly why a job is recommended.
                                    </p>
                                    <p>
                                        Our resume parsing technology reads your uploaded resume and automatically extracts your skills and experience, making it even easier to get personalized recommendations without hours of manual profile-building.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-8">Our Core Values</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Transparency', 'Innovation', 'Inclusivity', 'Integrity'].map((value) => (
                                <div key={value} className="card text-center py-4">
                                    <p className="text-white font-semibold">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
