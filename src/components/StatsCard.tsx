import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon: ReactNode;
  delay?: number;
}

export default function StatsCard({ title, value, subtitle, change, icon, delay = 0 }: StatsCardProps) {
  const hasPositiveChange = change !== undefined && change > 0;
  const hasNegativeChange = change !== undefined && change < 0;

  return (
    <div 
      className="bg-night-900/60 backdrop-blur-sm border border-night-800 rounded-2xl p-6 
                 stat-glow gradient-border animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-volt-500/10 border border-volt-500/20">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg
            ${hasPositiveChange ? 'text-volt-400 bg-volt-500/10' : ''}
            ${hasNegativeChange ? 'text-red-400 bg-red-500/10' : ''}
            ${!hasPositiveChange && !hasNegativeChange ? 'text-night-400 bg-night-800' : ''}
          `}>
            {hasPositiveChange && <TrendingUp className="w-3.5 h-3.5" />}
            {hasNegativeChange && <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-night-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-semibold text-night-100 mono-nums">{value}</p>
        {subtitle && (
          <p className="text-night-500 text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

