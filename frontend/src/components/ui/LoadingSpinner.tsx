import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
    const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

    const inner = (
        <div className="flex flex-col items-center gap-3">
            <Loader2 className={`${sizeMap[size]} text-primary-400 animate-spin`} />
            {text && <p className="text-sm text-gray-400">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
                {inner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-16">
            {inner}
        </div>
    );
}
