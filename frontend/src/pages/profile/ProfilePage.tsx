import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import type { User, UserUpdateData } from '@/types';
import { User as UserIcon, Code, Briefcase, Settings, Plus, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<UserUpdateData>({
        name: '', email: '', title: '', skills: [], experience_years: 0,
        preferences: { desired_roles: [], location_type: 'No Preference', min_salary: 0 },
    });
    const [skillInput, setSkillInput] = useState('');
    const [roleInput, setRoleInput] = useState('');

    useEffect(() => {
        if (!authUser) return;
        userService.getProfile(authUser.id)
            .then((data) => {
                setProfile(data);
                setForm({
                    name: data.name,
                    email: data.email,
                    title: data.title || '',
                    skills: data.skills || [],
                    experience_years: data.experience_years || 0,
                    preferences: data.preferences || { desired_roles: [], location_type: 'No Preference', min_salary: 0 },
                });
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, [authUser]);

    const handleSave = async () => {
        if (!authUser) return;
        setSaving(true);
        try {
            const updated = await userService.updateProfile(authUser.id, form);
            setProfile(updated);
            setEditMode(false);
            toast.success('Profile updated successfully!');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        const t = skillInput.trim();
        if (t && !form.skills.includes(t)) setForm({ ...form, skills: [...form.skills, t] });
        setSkillInput('');
    };

    const addRole = () => {
        const t = roleInput.trim();
        if (t && !form.preferences.desired_roles.includes(t))
            setForm({ ...form, preferences: { ...form.preferences, desired_roles: [...form.preferences.desired_roles, t] } });
        setRoleInput('');
    };

    if (loading) return <DashboardLayout><LoadingSpinner text="Loading profile..." /></DashboardLayout>;
    if (!profile) return null;

    return (
        <DashboardLayout>
            <div className="mb-6 animate-slide-up flex items-center justify-between">
                <div>
                    <h1 className="section-title text-3xl">My Profile</h1>
                    <p className="section-subtitle">Manage your professional information</p>
                </div>
                <button onClick={() => setEditMode(true)} className="btn-secondary flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="space-y-4">
                    <div className="card text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 shadow-lg shadow-primary-600/30">
                            {profile.name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                        <p className="text-gray-400 text-sm mt-1">{profile.title || 'No title set'}</p>
                        <p className="text-gray-500 text-xs mt-1">{profile.email}</p>
                        {authUser?.role === 'admin' && <span className="badge-primary mt-3 inline-block">Admin</span>}
                    </div>

                    <div className="card">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary-400" />Experience</h3>
                        <p className="text-2xl font-bold text-white">{profile.experience_years}<span className="text-base text-gray-400 font-normal"> years</span></p>
                    </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Skills */}
                    <div className="card">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Code className="w-4 h-4 text-primary-400" />Skills</h3>
                        {profile.skills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill) => (
                                    <span key={skill} className="badge-primary">{skill}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No skills added yet.</p>
                        )}
                    </div>

                    {/* Preferences */}
                    <div className="card">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-primary-400" />Job Preferences</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Preferred Work Type</span>
                                <span className="text-white text-sm font-medium">{profile.preferences?.location_type || 'Not set'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Minimum Salary</span>
                                <span className="text-white text-sm font-medium">
                                    {profile.preferences?.min_salary ? `$${profile.preferences.min_salary.toLocaleString()}/yr` : 'Not set'}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Desired Roles</p>
                                {profile.preferences?.desired_roles?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.preferences.desired_roles.map((role) => (
                                            <span key={role} className="badge-purple">{role}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No desired roles set.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={editMode} onClose={() => setEditMode(false)} title="Edit Profile" size="lg">
                <div className="space-y-5 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Title</label>
                            <input type="text" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Years of Experience</label>
                            <input type="number" min="0" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} className="input-field" />
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Skills</label>
                        <div className="flex gap-2 mb-2">
                            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                placeholder="Add skill..." className="input-field flex-1" />
                            <button type="button" onClick={addSkill} className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.skills.map((skill) => (
                                <span key={skill} className="badge-primary flex items-center gap-1">
                                    {skill}
                                    <button onClick={() => setForm({ ...form, skills: form.skills.filter((s) => s !== skill) })}><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Work Type Preference</label>
                            <select value={form.preferences.location_type}
                                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, location_type: e.target.value } })}
                                className="input-field">
                                {['Remote', 'Hybrid', 'Onsite', 'No Preference'].map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Min. Salary ($/yr)</label>
                            <input type="number" min="0" step="1000" value={form.preferences.min_salary}
                                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, min_salary: parseInt(e.target.value) || 0 } })}
                                className="input-field" />
                        </div>
                    </div>

                    {/* Desired Roles */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Desired Roles</label>
                        <div className="flex gap-2 mb-2">
                            <input type="text" value={roleInput} onChange={(e) => setRoleInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRole(); } }}
                                placeholder="e.g. Backend Engineer" className="input-field flex-1" />
                            <button type="button" onClick={addRole} className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.preferences.desired_roles.map((role) => (
                                <span key={role} className="badge-purple flex items-center gap-1">
                                    {role}
                                    <button onClick={() => setForm({ ...form, preferences: { ...form.preferences, desired_roles: form.preferences.desired_roles.filter((r) => r !== role) } })}><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
