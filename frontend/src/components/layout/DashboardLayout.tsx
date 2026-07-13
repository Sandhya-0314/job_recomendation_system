import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-white/5 bg-gray-950 flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    {(title || subtitle) && (
                        <div>
                            {title && <h1 className="text-lg font-semibold text-white">{title}</h1>}
                            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                        </div>
                    )}
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
