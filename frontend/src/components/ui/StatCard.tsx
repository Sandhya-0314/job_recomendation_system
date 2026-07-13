import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: 'primary' | 'emerald' | 'amber' | 'red' | 'purple';
}

const colorMap = {
    primary: 'from-primary-600 to-primary-700 shadow-primary-600/20',
    emerald: 'from-emerald-600 to-emerald-700 shadow-emerald-600/20',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
    red: 'from-red-600 to-red-700 shadow-red-600/20',
    purple: 'from-purple-600 to-purple-700 shadow-purple-600/20',
};

export default function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    trendUp,
    color = 'primary',
}: StatCardProps) {
    return (
        <div className="card-hover animate-fade-in">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm mb-1">{label}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-1.5 font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[color]} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}
