import {
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Coins,
    PieChartIcon,
    TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import StatsCard from "../components/StatsCard";
import { useAuth } from "../contexts/AuthContext";
import { useDenomination } from "../contexts/DenominationContext";
import { t } from "../i18n";
import {
    ReferralStats,
    fetchReferralStatsAuthenticated,
} from "../utils/boltzApi";
import {
    CHART_COLORS,
    FAILURE_RATE_COLORS,
    SWAP_TYPE_COLORS,
} from "../utils/colors";
import { getPairColor } from "../utils/colors";

interface PairStats {
    name: string;
    volume: number;
    trades: number;
    avgSize: number;
    percentage: number;
}

type PairSortField = "pair" | "volume" | "swaps" | "avgSize";
type SortDirection = "asc" | "desc";

// Simple bar component for failure rate comparison
function FailureRateBar({
    label,
    value,
    color,
    average,
}: {
    label: string;
    value: number;
    color: string;
    average: number;
}) {
    const strings = t();
    const percentage = Math.min(value * 100, 100);
    const diff = value - average;
    const isBetter = value < average; // Lower failure rate is better

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
                <span className="text-text-secondary text-sm">{label}</span>
                <div className="flex items-center gap-3">
                    <span
                        className={`text-text-muted text-xs ${isBetter ? "text-green-400" : diff > 0 ? "text-red-400" : ""}`}>
                        {strings.monthDetail.vsAvg} {diff >= 0 ? "+" : ""}
                        {(diff * 100).toFixed(1)}%
                    </span>
                    <span className="font-semibold mono-nums" style={{ color }}>
                        {(value * 100).toFixed(1)}%
                    </span>
                </div>
            </div>
            <div className="h-2 bg-navy-500 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

let strings = t();

// Pie chart tooltip
interface PieTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: PairStats;
    }>;
}

function PieTooltip({ active, payload }: PieTooltipProps) {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
        <div className="bg-navy-700 border border-navy-400 rounded-xl p-3 shadow-xl">
            <p className="text-text-secondary text-sm mb-1">{data.name}</p>
            <p className="font-semibold mono-nums text-text-primary">
                {data.percentage.toFixed(1)}%
            </p>
        </div>
    );
}

export default function MonthDetailPage() {
    const { year, month } = useParams<{ year: string; month: string }>();
    const navigate = useNavigate();
    const { partner } = useAuth();
    const { formatValue, formatSats } = useDenomination();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pairSortField, setPairSortField] = useState<PairSortField>("volume");
    const [pairSortDirection, setPairSortDirection] =
        useState<SortDirection>("desc");

    strings = t();

    useEffect(() => {
        const loadStats = async () => {
            if (!partner) return;

            try {
                const data = await fetchReferralStatsAuthenticated(
                    partner.apiKey,
                    partner.apiSecret,
                );
                setStats(data);
                setError(null);
            } catch (err) {
                console.error("Failed to load stats:", err);
                setError(strings.dashboard.errorLoadingStats);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, [partner]);

    // Find the selected month data
    const monthData = useMemo(() => {
        if (!stats || !year || !month) return null;

        const yearNum = parseInt(year);
        const monthCapitalized =
            month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

        return stats.monthly.find(
            (m) =>
                m.year === yearNum &&
                m.month.toLowerCase() === monthCapitalized.toLowerCase(),
        );
    }, [stats, year, month]);

    // Calculate all-time averages for comparison
    const averages = useMemo(() => {
        if (!stats || stats.monthly.length === 0) {
            return {
                volume: 0,
                swaps: 0,
                avgSize: 0,
                failureRates: { submarine: 0, reverse: 0, chain: 0 },
            };
        }

        const count = stats.monthly.length;
        return {
            volume:
                stats.monthly.reduce((sum, m) => sum + m.volumeBtc, 0) / count,
            swaps:
                stats.monthly.reduce((sum, m) => sum + m.swapCount, 0) / count,
            avgSize:
                stats.monthly.reduce((sum, m) => sum + m.avgSwapSize, 0) /
                count,
            failureRates: {
                submarine:
                    stats.monthly.reduce(
                        (sum, m) => sum + m.failureRates.submarine,
                        0,
                    ) / count,
                reverse:
                    stats.monthly.reduce(
                        (sum, m) => sum + m.failureRates.reverse,
                        0,
                    ) / count,
                chain:
                    stats.monthly.reduce(
                        (sum, m) => sum + m.failureRates.chain,
                        0,
                    ) / count,
            },
        };
    }, [stats]);

    // Calculate pair stats for the selected month - filter out pairs with no data
    const pairStats: PairStats[] = useMemo(() => {
        if (!monthData) return [];

        const pairs = Object.entries(monthData.pairVolume)
            .filter(
                ([_, volume]) =>
                    volume > 0 || (monthData.pairTrades[_] || 0) > 0,
            )
            .sort((a, b) => b[1] - a[1]);

        const totalVolume = monthData.volumeBtc;

        return pairs.map(([name, volume]) => {
            const trades = monthData.pairTrades[name] || 0;
            return {
                name,
                volume,
                trades,
                avgSize:
                    trades > 0
                        ? Math.round((volume * 100_000_000) / trades)
                        : 0,
                percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0,
            };
        });
    }, [monthData]);

    const sortedPairStats = useMemo(() => {
        return [...pairStats].sort((a, b) => {
            let comparison = 0;

            switch (pairSortField) {
                case "pair":
                    comparison = a.name.localeCompare(b.name);
                    break;
                case "volume":
                    comparison = a.volume - b.volume;
                    break;
                case "swaps":
                    comparison = a.trades - b.trades;
                    break;
                case "avgSize":
                    comparison = a.avgSize - b.avgSize;
                    break;
            }

            return pairSortDirection === "asc" ? comparison : -comparison;
        });
    }, [pairStats, pairSortField, pairSortDirection]);

    const handlePairSort = (field: PairSortField) => {
        if (pairSortField === field) {
            setPairSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
            return;
        }

        setPairSortField(field);
        setPairSortDirection(field === "pair" ? "asc" : "desc");
    };

    const renderSortIndicator = (field: PairSortField) => {
        if (pairSortField !== field) {
            return <span className="w-4 h-4" />;
        }
        return pairSortDirection === "asc" ? (
            <ChevronUp className="w-4 h-4 text-boltz-primary" />
        ) : (
            <ChevronDown className="w-4 h-4 text-boltz-primary" />
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-navy-500">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-boltz-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">
                        {strings.monthDetail.loading}
                    </p>
                </div>
            </div>
        );
    }

    if (error || !monthData) {
        return (
            <div className="min-h-screen bg-navy-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8">
                        <ArrowLeft className="w-5 h-5" />
                        {strings.common.back}
                    </button>
                    <div className="text-center py-16">
                        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-text-primary mb-2">
                            {error || strings.monthDetail.notFound}
                        </h2>
                        <p className="text-text-secondary">
                            {strings.monthDetail.tryAgain}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const pageTitle = `${monthData.month} ${monthData.year} ${strings.monthDetail.title}`;

    return (
        <div className="min-h-screen bg-navy-500">
            {/* Header */}
            <header className="border-b border-navy-400/50 bg-navy-600/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">
                                    {strings.common.back}
                                </span>
                            </button>
                            <div className="h-6 w-px bg-navy-400/50" />
                            <div>
                                <h1 className="text-lg font-semibold text-text-primary">
                                    {pageTitle}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title={strings.monthDetail.volume}
                        value={formatValue(monthData.volumeBtc)}
                        subtitle={`${strings.monthDetail.vsAvg} ${monthData.volumeBtc >= averages.volume ? "+" : ""}${(
                            (monthData.volumeBtc / averages.volume - 1) *
                            100
                        ).toFixed(1)}%`}
                        icon={
                            <TrendingUp
                                className="w-5 h-5"
                                style={{ color: CHART_COLORS.primary }}
                            />
                        }
                        delay={0}
                    />
                    <StatsCard
                        title={strings.monthDetail.swaps}
                        value={monthData.swapCount.toLocaleString()}
                        subtitle={`${strings.monthDetail.vsAvg} ${monthData.swapCount >= averages.swaps ? "+" : ""}${(
                            (monthData.swapCount / averages.swaps - 1) *
                            100
                        ).toFixed(1)}%`}
                        icon={
                            <BarChart3
                                className="w-5 h-5"
                                style={{ color: SWAP_TYPE_COLORS.reverse }}
                            />
                        }
                        delay={50}
                    />
                    <StatsCard
                        title={strings.monthDetail.avgSwapSize}
                        value={formatSats(monthData.avgSwapSize)}
                        subtitle={`${strings.monthDetail.vsAvg} ${monthData.avgSwapSize >= averages.avgSize ? "+" : ""}${(
                            (monthData.avgSwapSize / averages.avgSize - 1) *
                            100
                        ).toFixed(1)}%`}
                        icon={
                            <Coins
                                className="w-5 h-5"
                                style={{ color: SWAP_TYPE_COLORS.submarine }}
                            />
                        }
                        delay={100}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Failure Rates Section */}
                    <div className="bg-navy-600/60 backdrop-blur-sm border border-navy-400/50 rounded-2xl p-6 stat-glow">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <h3 className="text-lg font-semibold text-text-primary">
                                {strings.monthDetail.failureRates}
                            </h3>
                        </div>

                        <FailureRateBar
                            label={strings.charts.swapTypes.submarine}
                            value={monthData.failureRates.submarine}
                            color={FAILURE_RATE_COLORS.submarine}
                            average={averages.failureRates.submarine}
                        />
                        <FailureRateBar
                            label={strings.charts.swapTypes.reverse}
                            value={monthData.failureRates.reverse}
                            color={FAILURE_RATE_COLORS.reverse}
                            average={averages.failureRates.reverse}
                        />
                        <FailureRateBar
                            label={strings.charts.swapTypes.chain}
                            value={monthData.failureRates.chain}
                            color={FAILURE_RATE_COLORS.chain}
                            average={averages.failureRates.chain}
                        />
                    </div>

                    {/* Pair Distribution - Pie Chart */}
                    <div className="bg-navy-600/60 backdrop-blur-sm border border-navy-400/50 rounded-2xl p-6 stat-glow">
                        <div className="flex items-center gap-3 mb-6">
                            <PieChartIcon className="w-5 h-5 text-boltz-primary" />
                            <h3 className="text-lg font-semibold text-text-primary">
                                {strings.monthDetail.pairDistribution}
                            </h3>
                        </div>

                        {pairStats.length > 0 ? (
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="h-64 w-64">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pairStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                stroke="none"
                                                dataKey="percentage">
                                                {pairStats.map((pair) => (
                                                    <Cell
                                                        key={`cell-${pair.name}`}
                                                        fill={getPairColor(
                                                            pair.name,
                                                        )}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<PieTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {pairStats.map((pair) => (
                                        <div
                                            key={pair.name}
                                            className="flex items-center gap-3">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        getPairColor(pair.name),
                                                }}
                                            />
                                            <span className="text-text-secondary text-sm flex-1">
                                                {pair.name}
                                            </span>
                                            <span className="text-text-primary text-sm font-medium">
                                                {pair.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-text-muted text-center py-8">
                                {strings.dashboard.noPairData}
                            </p>
                        )}
                    </div>
                </div>

                {/* Pair Volume Table */}
                <div className="bg-navy-600/60 backdrop-blur-sm border border-navy-400/50 rounded-2xl overflow-hidden stat-glow">
                    <div className="p-6 border-b border-navy-400/30">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-boltz-primary" />
                            <h3 className="text-lg font-semibold text-text-primary">
                                {strings.monthDetail.volumeByPair}
                            </h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-navy-500/50">
                                    <th
                                        className="text-left text-text-secondary text-sm font-medium px-6 py-4 cursor-pointer hover:text-text-primary transition-colors select-none"
                                        onClick={() => handlePairSort("pair")}>
                                        <div className="inline-flex items-center gap-2">
                                            <span>{strings.table.pair}</span>
                                            {renderSortIndicator("pair")}
                                        </div>
                                    </th>
                                    <th
                                        className="text-right text-text-secondary text-sm font-medium px-6 py-4 cursor-pointer hover:text-text-primary transition-colors select-none"
                                        onClick={() =>
                                            handlePairSort("volume")
                                        }>
                                        <div className="inline-flex items-center gap-2 flex-row-reverse">
                                            <span>{strings.table.volume}</span>
                                            {renderSortIndicator("volume")}
                                        </div>
                                    </th>
                                    <th
                                        className="text-right text-text-secondary text-sm font-medium px-6 py-4 cursor-pointer hover:text-text-primary transition-colors select-none"
                                        onClick={() => handlePairSort("swaps")}>
                                        <div className="inline-flex items-center gap-2 flex-row-reverse">
                                            <span>{strings.table.swaps}</span>
                                            {renderSortIndicator("swaps")}
                                        </div>
                                    </th>
                                    <th
                                        className="text-right text-text-secondary text-sm font-medium px-6 py-4 cursor-pointer hover:text-text-primary transition-colors select-none"
                                        onClick={() =>
                                            handlePairSort("avgSize")
                                        }>
                                        <div className="inline-flex items-center gap-2 flex-row-reverse">
                                            <span>{strings.table.avgSize}</span>
                                            {renderSortIndicator("avgSize")}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedPairStats.map((pair) => (
                                    <tr
                                        key={pair.name}
                                        className="border-t border-navy-400/20 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            getPairColor(
                                                                pair.name,
                                                            ),
                                                    }}
                                                />
                                                <span className="text-text-primary font-medium">
                                                    {pair.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-text-primary font-semibold mono-nums">
                                                {formatValue(pair.volume)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-text-primary font-semibold mono-nums">
                                                {pair.trades.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-text-secondary mono-nums">
                                                {formatSats(pair.avgSize)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
