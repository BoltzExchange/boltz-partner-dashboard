import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  showChange?: boolean;
  icon: ReactNode;
  delay?: number;
}

export default function StatsCard({ title, value, subtitle, change, showChange = true, icon, delay = 0 }: StatsCardProps) {
  const hasPositiveChange = change !== undefined && change > 0;
  const hasNegativeChange = change !== undefined && change < 0;

  return (
    <div 
      className="bg-navy-600/60 backdrop-blur-sm border border-navy-400/50 rounded-2xl p-6 
                 stat-glow animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-boltz-primary/10 border border-boltz-primary/20">
          {icon}
        </div>
        {showChange && change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg
            ${hasPositiveChange ? 'text-boltz-primary bg-boltz-primary/10' : ''}
            ${hasNegativeChange ? 'text-red-400 bg-red-500/10' : ''}
            ${!hasPositiveChange && !hasNegativeChange ? 'text-text-muted bg-navy-400' : ''}
          `}>
            {hasPositiveChange && <TrendingUp className="w-3.5 h-3.5" />}
            {hasNegativeChange && <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-text-secondary text-sm font-medium">{title}</p>
        <p className="text-3xl font-semibold text-text-primary mono-nums">{value}</p>
        {subtitle && (
          <p className="text-text-muted text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
