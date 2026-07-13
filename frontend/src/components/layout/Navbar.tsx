import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Menu, X, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardPath = () => {
        if (user?.role === 'admin') return '/admin';
        return '/dashboard';
    };

    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary-600/40 transition-all">
                            <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg gradient-text">JobSphere</span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.href
                                        ? 'text-primary-300 bg-primary-600/10'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Dashboard Link */}
                                <Link to={getDashboardPath()} className="hidden md:block btn-secondary text-sm py-2 px-4">
                                    Dashboard
                                </Link>

                                {/* User dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-all"
                                    >
                                        <div className="w-7 h-7 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden sm:block text-sm text-white font-medium max-w-[100px] truncate">
                                            {user?.name}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 top-12 w-52 glass-dark rounded-2xl border border-white/10 shadow-2xl p-1 animate-fade-in z-50">
                                            <Link
                                                to="/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                <User className="w-4 h-4" />
                                                My Profile
                                            </Link>
                                            <Link
                                                to={getDashboardPath()}
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                <Bell className="w-4 h-4" />
                                                Dashboard
                                            </Link>
                                            <div className="border-t border-white/5 mt-1 pt-1">
                                                <button
                                                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                                                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-gray-950/95 border-t border-white/5 px-4 py-3 space-y-1 animate-fade-in">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            to={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5"
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isAuthenticated && (
                        <Link
                            to={getDashboardPath()}
                            onClick={() => setMobileOpen(false)}
                            className="block px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5"
                        >
                            Dashboard
                        </Link>
                    )}
                </div>
            )}

            {/* Click outside to close dropdown */}
            {dropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            )}
        </nav>
    );
}
