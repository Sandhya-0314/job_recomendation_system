import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SearchBar from '@/components/ui/SearchBar';
import type { User } from '@/types';
import { userService } from '@/services/userService';
import { Users, Code, Briefcase, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        userService.getAllUsers()
            .then(setUsers)
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.title || '').toLowerCase().includes(q);
    });

    if (loading) return <DashboardLayout><LoadingSpinner text="Loading users..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="mb-6 animate-slide-up">
                <h1 className="section-title text-3xl">Manage Users</h1>
                <p className="section-subtitle">{users.length} registered users</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card text-center">
                    <div className="text-2xl font-bold text-white">{users.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Users</div>
                </div>
                <div className="card text-center">
                    <div className="text-2xl font-bold text-primary-400">{users.filter((u) => u.role !== 'admin').length}</div>
                    <div className="text-xs text-gray-500 mt-1">Job Seekers</div>
                </div>
                <div className="card text-center">
                    <div className="text-2xl font-bold text-amber-400">{users.filter((u) => u.role === 'admin').length}</div>
                    <div className="text-xs text-gray-500 mt-1">Admins</div>
                </div>
            </div>

            <div className="mb-4">
                <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or title..." />
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="table-header">User</th>
                                <th className="table-header">Title</th>
                                <th className="table-header">Skills</th>
                                <th className="table-header">Experience</th>
                                <th className="table-header">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u) => (
                                <tr key={u.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                                    <td className="table-cell">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-gradient-to-br from-primary-700 to-primary-900 rounded-xl flex items-center justify-center text-sm font-bold text-primary-300 flex-shrink-0">
                                                {u.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{u.name}</p>
                                                <p className="text-gray-500 text-xs">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <span className="flex items-center gap-1.5 text-gray-300 text-sm">
                                            <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                                            {u.title || '—'}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {u.skills?.slice(0, 3).map((s) => (
                                                <span key={s} className="badge badge-primary text-xs">{s}</span>
                                            ))}
                                            {(u.skills?.length || 0) > 3 && (
                                                <span className="text-gray-500 text-xs flex items-center gap-0.5">
                                                    <Code className="w-3 h-3" />+{(u.skills?.length || 0) - 3}
                                                </span>
                                            )}
                                            {!u.skills?.length && <span className="text-gray-600 text-xs">No skills</span>}
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <span className="text-gray-300 text-sm flex items-center gap-1">
                                            <Star className="w-3 h-3 text-gray-500" />
                                            {u.experience_years ?? 0} yr{u.experience_years !== 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        {u.role === 'admin' ? (
                                            <span className="badge badge-warning">Admin</span>
                                        ) : (
                                            <span className="badge badge-primary">User</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 text-sm">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
