import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchReferralStatsAuthenticated } from '../services/boltzApi';
import { ReferralStats } from '../types';
import StatsCard from './StatsCard';
import PerformanceChart from './PerformanceChart';
import MonthlyTable from './MonthlyTable';
import { 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Coins, 
  LogOut, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react';

export default function Dashboard() {
  const { partner, logout } = useAuth();
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

  const formatBtc = (btc: number) => {
    if (btc >= 1) return `${btc.toFixed(2)} BTC`;
    return `${(btc * 100_000_000).toLocaleString()} sats`;
  };

  const getLastMonthChange = () => {
    if (!stats || stats.monthly.length < 2) return undefined;
    return stats.monthly[stats.monthly.length - 1].volumeChange;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-volt-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-night-400">Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-night-100 mb-2">Unable to Load Data</h2>
          <p className="text-night-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => loadStats()}
              className="px-6 py-3 bg-volt-500 hover:bg-volt-400 text-night-950 font-semibold rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={logout}
              className="px-6 py-3 bg-night-800 hover:bg-night-700 text-night-200 font-semibold rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-night-800 bg-night-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-volt-500/10 border border-volt-500/20">
                <Zap className="w-5 h-5 text-volt-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-night-100">Partner Dashboard</h1>
                <p className="text-sm text-night-500 font-mono">{partner?.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadStats(true)}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-night-800 hover:bg-night-700 text-night-300 
                         hover:text-night-100 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-night-800 
                         hover:bg-night-700 text-night-300 hover:text-night-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Volume"
            value={formatBtc(stats?.allTime.volumeBtc || 0)}
            subtitle="All-time trading volume"
            change={getLastMonthChange()}
            icon={<TrendingUp className="w-5 h-5 text-volt-400" />}
            delay={0}
          />
          <StatsCard
            title="Total Trades"
            value={(stats?.allTime.tradeCount || 0).toLocaleString()}
            subtitle="Completed swaps"
            icon={<BarChart3 className="w-5 h-5 text-volt-400" />}
            delay={50}
          />
          <StatsCard
            title="Average Trade"
            value={`${(stats?.allTime.avgTradeSize || 0).toLocaleString()} sats`}
            subtitle="Per transaction"
            icon={<Coins className="w-5 h-5 text-volt-400" />}
            delay={100}
          />
          <StatsCard
            title="Est. Fees Earned"
            value={`${((stats?.allTime.feesEarnedSats || 0) / 100_000_000).toFixed(6)} BTC`}
            subtitle="Partner revenue share"
            icon={<Zap className="w-5 h-5 text-volt-400" />}
            delay={150}
          />
        </div>

        {/* Charts */}
        {stats && stats.monthly.length > 0 && (
          <>
            <div className="mb-6">
              <PerformanceChart
                data={stats.monthly}
                dataKey="volumeBtc"
                title="Volume Over Time (BTC)"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <PerformanceChart
                data={stats.monthly}
                dataKey="tradeCount"
                title="Trade Count Over Time"
              />
              <PerformanceChart
                data={stats.monthly}
                dataKey="avgTradeSize"
                title="Average Trade Size (sats)"
              />
            </div>
          </>
        )}

        {/* Monthly Table */}
        {stats && stats.monthly.length > 0 && (
          <MonthlyTable data={stats.monthly} />
        )}

        {/* Empty state */}
        {(!stats || stats.monthly.length === 0) && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-night-800 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-night-500" />
            </div>
            <h3 className="text-lg font-semibold text-night-200 mb-2">No Data Yet</h3>
            <p className="text-night-400 max-w-md mx-auto">
              Once your referral link starts generating swaps, your stats will appear here.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-night-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-night-600 text-sm">
            Powered by{' '}
            <a 
              href="https://boltz.exchange" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-volt-500 hover:text-volt-400 transition-colors"
            >
              Boltz Exchange
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
