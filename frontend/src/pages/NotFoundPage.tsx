import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="text-center animate-fade-in">
                <div className="text-9xl font-black gradient-text mb-4 leading-none">404</div>
                <div className="w-16 h-16 bg-amber-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex items-center gap-3 justify-center">
                    <Link to="/" className="btn-primary flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                    <button onClick={() => window.history.back()} className="btn-secondary">
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
