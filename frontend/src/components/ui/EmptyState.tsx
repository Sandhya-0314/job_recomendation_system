import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            {Icon && (
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-gray-500" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            {description && <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>}
            {action && action}
        </div>
    );
}
