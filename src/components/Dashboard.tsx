import {
    AlertCircle,
    BarChart3,
    Coins,
    LogOut,
    RefreshCw,
    TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { Denomination, useDenomination } from "../contexts/DenominationContext";
import { t } from "../i18n";
import {
    ReferralStats,
    fetchReferralId,
    fetchReferralStatsAuthenticated,
} from "../utils/boltzApi";
import DenominationToggle from "./DenominationToggle";
import Footer from "./Footer";
import LoadingSpinner from "./LoadingSpinner";
import MonthlyTable from "./MonthlyTable";
import PerformanceChart from "./PerformanceChart";
import StatsCard from "./StatsCard";

export default function Dashboard() {
    const { partner, logout } = useAuth();
    const { denomination, formatValue, formatSats } = useDenomination();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [referralName, setReferralName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const strings = t();

    const loadStats = async (showRefreshIndicator = false) => {
        if (!partner) return;

        if (showRefreshIndicator) {
            setIsRefreshing(true);
        }

        try {
            const [data, refId] = await Promise.all([
                fetchReferralStatsAuthenticated(
                    partner.apiKey,
                    partner.apiSecret,
                ),
                referralName
                    ? Promise.resolve(referralName)
                    : fetchReferralId(partner.apiKey, partner.apiSecret),
            ]);
            setStats(data);
            setReferralName(refId);
            setError(null);
        } catch (err) {
            console.error("Failed to load stats:", err);
            setError(strings.dashboard.errorLoadingStats);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [partner]);

    if (isLoading) {
        return <LoadingSpinner message={strings.dashboard.loadingStats} />;
    }

    if (error && !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-navy-500">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-text-primary mb-2">
                        {strings.dashboard.unableToLoadData}
                    </h2>
                    <p className="text-text-secondary mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => loadStats()}
                            className="px-6 py-3 bg-boltz-primary hover:bg-boltz-primary-light text-navy-700 font-semibold rounded-lg transition-all hover:shadow-[0_0_20px_rgba(232,203,43,0.4)]">
                            {strings.common.tryAgain}
                        </button>
                        <button
                            onClick={logout}
                            className="px-6 py-3 bg-navy-400 hover:bg-navy-300 text-text-primary font-semibold rounded-lg transition-colors">
                            {strings.common.signOut}
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
                            <img
                                src="/boltz-logo.svg"
                                alt={strings.common.boltz}
                                className="w-10 h-10"
                            />
                            <div>
                                <h1 className="text-lg font-semibold text-text-primary">
                                    {strings.dashboard.title}
                                </h1>
                                <p className="text-sm text-text-muted font-mono">
                                    {referralName || ""}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <DenominationToggle />
                            <button
                                onClick={() => loadStats(true)}
                                disabled={isRefreshing}
                                className="p-2 rounded-lg bg-navy-400 hover:bg-navy-300 text-text-secondary 
                         hover:text-text-primary transition-colors disabled:opacity-50"
                                title={strings.dashboard.refreshData}>
                                <RefreshCw
                                    className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                                />
                            </button>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-400 
                         hover:bg-navy-300 text-text-secondary hover:text-text-primary transition-colors">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    {strings.common.signOut}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title={strings.dashboard.totalVolume}
                        value={formatValue(stats?.allTime.volumeBtc || 0)}
                        subtitle={strings.dashboard.allTimeSwapVolume}
                        icon={
                            <TrendingUp
                                className="w-5 h-5"
                                style={{ color: "#e8cb2b" }}
                            />
                        }
                        iconColor="#e8cb2b"
                        delay={0}
                    />
                    <StatsCard
                        title={strings.dashboard.totalSwaps}
                        value={(stats?.allTime.swapCount || 0).toLocaleString()}
                        subtitle={strings.dashboard.completedSwaps}
                        icon={
                            <BarChart3
                                className="w-5 h-5"
                                style={{ color: "#f7931a" }}
                            />
                        }
                        iconColor="#f7931a"
                        delay={50}
                    />
                    <StatsCard
                        title={strings.dashboard.avgSwapSize}
                        value={formatSats(stats?.allTime.avgSwapSize || 0)}
                        subtitle={strings.dashboard.perSwap}
                        icon={
                            <Coins
                                className="w-5 h-5"
                                style={{ color: "#4fadc2" }}
                            />
                        }
                        iconColor="#4fadc2"
                        delay={100}
                    />
                </div>

                {stats && stats.monthly.length > 0 && (
                    <>
                        <div className="mb-6">
                            <PerformanceChart
                                data={stats.monthly}
                                dataKey="volumeBtc"
                                title={`${strings.dashboard.volumeOverTime} (${denomination === Denomination.BTC ? strings.common.btc : strings.common.sats})`}
                                color="#e8cb2b"
                            />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <PerformanceChart
                                data={stats.monthly}
                                dataKey="swapCount"
                                title={strings.dashboard.swapCountOverTime}
                                color="#f7931a"
                            />
                            <PerformanceChart
                                data={stats.monthly}
                                dataKey="avgSwapSize"
                                title={`${strings.dashboard.avgSwapSizeOverTime} (${denomination === Denomination.BTC ? strings.common.btc : strings.common.sats})`}
                                color="#4fadc2"
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
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                            {strings.dashboard.noDataYet}
                        </h3>
                        <p className="text-text-secondary max-w-md mx-auto">
                            {strings.dashboard.noDataDescription}
                        </p>
                    </div>
                )}
            </main>

            <footer className="border-t border-navy-400/50 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Footer />
                </div>
            </footer>
        </div>
    );
}
