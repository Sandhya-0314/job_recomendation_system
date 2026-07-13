import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, Briefcase, Star, BookmarkCheck,
    FileText, MessageSquare, User, LogOut, Sparkles,
    Users, Settings, BarChart3, CheckSquare
} from 'lucide-react';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'admin';

    const userLinks = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Browse Jobs', href: '/jobs', icon: Briefcase },
        { label: 'AI Recommendations', href: '/recommendations', icon: Sparkles },
        { label: 'My Applications', href: '/applications', icon: FileText },
        { label: 'Saved Jobs', href: '/saved', icon: BookmarkCheck },
        { label: 'Resume', href: '/resume', icon: Star },
        { label: 'AI Career Chat', href: '/chat', icon: MessageSquare },
        { label: 'My Profile', href: '/profile', icon: User },
    ];

    const adminLinks = [
        { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'User Management', href: '/admin/users', icon: Users },
        { label: 'Job Management', href: '/admin/jobs', icon: Briefcase },
        { label: 'Applications', href: '/admin/applications', icon: CheckSquare },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Settings', href: '/profile', icon: Settings },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && onClose && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-white/5 z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
            >
                {/* Brand */}
                <div className="flex items-center gap-2 px-6 py-5 border-b border-white/5">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg gradient-text">JobSphere</span>
                </div>

                {/* User info */}
                <div className="px-4 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            {isAdmin && (
                                <span className="badge-primary text-xs mt-0.5">Admin</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.href}
                                to={link.href}
                                end={link.href === '/dashboard' || link.href === '/admin'}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {link.label}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
