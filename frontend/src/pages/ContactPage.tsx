import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        await new Promise((r) => setTimeout(r, 1000));
        setSending(false);
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <main className="pt-24 pb-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16 animate-slide-up">
                        <div className="inline-flex items-center gap-2 bg-primary-900/40 border border-primary-700/40 rounded-full px-4 py-2 text-sm text-primary-300 mb-6">
                            <MessageSquare className="w-4 h-4" /> Get in Touch
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4">Contact <span className="gradient-text">Us</span></h1>
                        <p className="text-gray-400 max-w-lg mx-auto">Have a question or feedback? We'd love to hear from you. Send us a message and we'll get back to you shortly.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact info */}
                        <div className="space-y-4">
                            {[
                                { icon: Mail, label: 'Email', value: 'hello@jobsphere.ai', color: 'from-primary-600 to-primary-700' },
                                { icon: Phone, label: 'Phone', value: '+1 (555) 000-0000', color: 'from-accent-600 to-accent-700' },
                                { icon: MapPin, label: 'Location', value: 'San Francisco, CA 94102', color: 'from-emerald-600 to-emerald-700' },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="card flex items-start gap-4">
                                        <div className={`w-11 h-11 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs mb-0.5">{item.label}</p>
                                            <p className="text-white font-medium text-sm">{item.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-2 glass-dark rounded-2xl border border-white/10 p-8 shadow-2xl">
                            {sent ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                                    <div className="w-16 h-16 bg-emerald-900/40 rounded-2xl flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                                    <p className="text-gray-400">Thank you for reaching out. We'll respond within 1-2 business days.</p>
                                    <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                                        className="btn-secondary mt-6">Send Another Message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Your Name</label>
                                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="John Doe" className="input-field" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="you@example.com" className="input-field" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
                                        <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            placeholder="How can we help?" className="input-field" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                                        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            placeholder="Tell us more..." rows={5} className="input-field resize-none" required />
                                    </div>
                                    <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
                                        {sending ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Send Message</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
