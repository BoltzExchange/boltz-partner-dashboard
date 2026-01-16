import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDenomination, Denomination } from '../contexts/DenominationContext';
import { fetchReferralStatsAuthenticated } from '../services/boltzApi';
import { ReferralStats } from '../types';
import StatsCard from './StatsCard';
import PerformanceChart from './PerformanceChart';
import MonthlyTable from './MonthlyTable';
import DenominationToggle from './DenominationToggle';
import { 
  TrendingUp, 
  BarChart3, 
  Coins, 
  LogOut, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { partner, logout } = useAuth();
  const { denomination, formatValue, formatSats } = useDenomination();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = async (showRefreshIndicator = false) => {
    if (!partner) return;
    
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      const data = await fetchReferralStatsAuthenticated(partner.apiKey, partner.apiSecret);
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('Failed to load stats. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [partner]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-500">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-boltz-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-navy-500">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Unable to Load Data</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => loadStats()}
              className="px-6 py-3 bg-boltz-primary hover:bg-boltz-primary-light text-navy-700 font-semibold rounded-lg transition-all hover:shadow-[0_0_20px_rgba(232,203,43,0.4)]"
            >
              Try Again
            </button>
            <button
              onClick={logout}
              className="px-6 py-3 bg-navy-400 hover:bg-navy-300 text-text-primary font-semibold rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-500">
      <header className="border-b border-navy-400/50 bg-navy-600/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/boltz-logo.svg" alt="Boltz" className="w-10 h-10" />
              <div>
                <h1 className="text-lg font-semibold text-text-primary">Partner Dashboard</h1>
                <p className="text-sm text-text-muted font-mono">{partner?.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DenominationToggle />
              <button
                onClick={() => loadStats(true)}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-navy-400 hover:bg-navy-300 text-text-secondary 
                         hover:text-text-primary transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-400 
                         hover:bg-navy-300 text-text-secondary hover:text-text-primary transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Volume"
            value={formatValue(stats?.allTime.volumeBtc || 0)}
            subtitle="All-time swap volume"
            icon={<TrendingUp className="w-5 h-5 text-boltz-primary" />}
            delay={0}
          />
          <StatsCard
            title="Total Swaps"
            value={(stats?.allTime.swapCount || 0).toLocaleString()}
            subtitle="Completed swaps"
            icon={<BarChart3 className="w-5 h-5 text-boltz-primary" />}
            delay={50}
          />
          <StatsCard
            title="Average Swap Size"
            value={formatSats(stats?.allTime.avgSwapSize || 0)}
            subtitle="Per swap"
            icon={<Coins className="w-5 h-5 text-boltz-primary" />}
            delay={100}
          />
        </div>

        {stats && stats.monthly.length > 0 && (
          <>
            <div className="mb-6">
              <PerformanceChart
                data={stats.monthly}
                dataKey="volumeBtc"
                title={`Volume Over Time (${denomination === Denomination.BTC ? 'BTC' : 'sats'})`}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <PerformanceChart
                data={stats.monthly}
                dataKey="swapCount"
                title="Swap Count Over Time"
              />
              <PerformanceChart
                data={stats.monthly}
                dataKey="avgSwapSize"
                title={`Average Swap Size (${denomination === Denomination.BTC ? 'BTC' : 'sats'})`}
              />
            </div>
          </>
        )}

        {stats && stats.monthly.length > 0 && (
          <MonthlyTable data={stats.monthly} />
        )}

        {(!stats || stats.monthly.length === 0) && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-navy-400 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No Data Yet</h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Once your referral link starts generating swaps, your stats will appear here.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-navy-400/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-text-muted text-sm">
            Powered by{' '}
            <a 
              href="https://boltz.exchange" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-boltz-link hover:text-boltz-link-hover transition-colors"
            >
              Boltz
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
