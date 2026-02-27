import { Layers, LayoutGrid } from "lucide-react";
import { ReactNode, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from "recharts";

import { Denomination, useDenomination } from "../contexts/DenominationContext";
import { t } from "../i18n";
import { MonthlyStats } from "../utils/boltzApi";
import { CHART_COLORS } from "../utils/colors";
import { getPairColor } from "../utils/colors";

interface PairVolumeChartProps {
    data: MonthlyStats[];
    title: ReactNode;
}

interface ChartDataPoint {
    label: string;
    month: string;
    year: number;
    [pair: string]: string | number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
    formatChartValue: (value: number) => string;
}

function CustomTooltip({
    active,
    payload,
    label,
    formatChartValue,
}: CustomTooltipProps) {
    const strings = t();
    if (!active || !payload || !payload.length) return null;

    // Filter out null/undefined values and sort by value descending
    const validPayload = payload
        .filter((p) => p.value !== null && p.value !== undefined && p.value > 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));

    if (validPayload.length === 0) return null;

    const total = validPayload.reduce((sum, p) => sum + (p.value || 0), 0);

    return (
        <div className="bg-navy-700 border border-navy-400 rounded-xl p-4 shadow-xl">
            <p className="text-text-secondary text-sm mb-2">{label}</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
                {validPayload.map((entry, index) => {
                    const pair = entry.dataKey as string;
                    const percentage =
                        total > 0 ? ((entry.value || 0) / total) * 100 : 0;
                    return (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-text-primary text-sm">
                                    {pair}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-text-primary font-semibold mono-nums">
                                    {formatChartValue(entry.value || 0)}
                                </span>
                                <span className="text-text-muted text-xs ml-2">
                                    ({percentage.toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="border-t border-navy-400 mt-2 pt-2">
                <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">
                        {strings.common.total}
                    </span>
                    <span className="text-boltz-primary font-semibold mono-nums">
                        {formatChartValue(total)}
                    </span>
                </div>
            </div>
        </div>
    );
}

interface SinglePairChartProps {
    pair: string;
    data: Array<{ label: string; volume: number }>;
    color: string;
    formatChartValue: (value: number) => string;
    formatYAxis: (value: number) => string;
}

function SinglePairTooltip({
    active,
    payload,
    label,
    pair,
    formatChartValue,
}: CustomTooltipProps & { pair: string }) {
    if (!active || !payload || !payload.length) return null;
    const value = payload[0].value || 0;

    return (
        <div className="bg-navy-700 border border-navy-400 rounded-xl p-3 shadow-xl">
            <p className="text-text-secondary text-sm mb-1">{label}</p>
            <div className="flex items-center justify-between gap-4">
                <span className="text-text-secondary text-sm">{pair}</span>
                <span className="font-semibold mono-nums text-text-primary">
                    {formatChartValue(value)}
                </span>
            </div>
        </div>
    );
}

function SinglePairChart({
    pair,
    data,
    color,
    formatChartValue,
    formatYAxis,
}: SinglePairChartProps) {
    const gradientId = `gradient-${pair.replace(/[^a-zA-Z0-9]/g, "-")}`;

    return (
        <div className="bg-navy-500/50 border border-navy-400/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                />
                <h4 className="text-sm font-semibold text-text-primary">
                    {pair}
                </h4>
            </div>
            <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient
                                id={gradientId}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1">
                                <stop
                                    offset="5%"
                                    stopColor={color}
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={color}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={CHART_COLORS.grid}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="label"
                            tick={{ fill: CHART_COLORS.axisTick, fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: CHART_COLORS.grid }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fill: CHART_COLORS.axisTick, fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatYAxis}
                        />
                        <Tooltip
                            content={
                                <SinglePairTooltip
                                    pair={pair}
                                    formatChartValue={formatChartValue}
                                />
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="volume"
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                            dot={false}
                            activeDot={{
                                fill: color,
                                strokeWidth: 2,
                                stroke: CHART_COLORS.activeDotStroke,
                                r: 4,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default function PairVolumeChart({ data, title }: PairVolumeChartProps) {
    const { denomination } = useDenomination();
    const strings = t();
    const [view, setView] = useState<"combined" | "separate">("combined");

    const formatChartValue = (value: number): string => {
        if (denomination === Denomination.SAT) {
            return `${Math.round(value).toLocaleString()} sats`;
        }
        return `${value.toFixed(8)} BTC`;
    };

    // Collect all unique pairs from the data - filter out pairs with no data
    const allPairs = new Set<string>();
    data.forEach((month) => {
        Object.entries(month.pairVolume).forEach(([pair, volume]) => {
            if (volume > 0 || (month.pairTrades[pair] || 0) > 0) {
                allPairs.add(pair);
            }
        });
    });
    const pairs = Array.from(allPairs).sort();

    const formatYAxis = (value: number) => {
        if (denomination === Denomination.SAT) {
            if (value >= 1_000_000_000)
                return `${(value / 1_000_000_000).toFixed(1)}B`;
            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
            return value.toLocaleString();
        }
        return `${value.toFixed(3)}`;
    };

    const separateFormatYAxis = (value: number) => {
        if (denomination === Denomination.SAT) {
            if (value >= 1_000_000_000)
                return `${(value / 1_000_000_000).toFixed(0)}B`;
            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
            return value.toLocaleString();
        }
        return value < 1 ? `${value.toFixed(3)}` : `${value.toFixed(1)}`;
    };

    if (pairs.length === 0) {
        return (
            <div className="bg-navy-600/60 backdrop-blur-sm border border-navy-400/50 rounded-2xl p-6 stat-glow">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                    {title}
                </h3>
                <div className="h-72 flex items-center justify-center">
                    <p className="text-text-muted">
                        {strings.dashboard.noPairData}
                    </p>
                </div>
            </div>
        );
    }

    // Transform data for combined chart
    const chartData: ChartDataPoint[] = data.map((item) => {
        const point: ChartDataPoint = {
            label: `${item.month} ${item.year}`,
            month: item.month,
            year: item.year,
        };

        pairs.forEach((pair) => {
            const volume = item.pairVolume[pair] || 0;
            point[pair] =
                denomination === Denomination.SAT
                    ? volume * 100_000_000
                    : volume;
        });

        return point;
    });

    return (
        <div className="bg-navy-600/60 backdrop-blur-sm border border-navy-400/50 rounded-2xl p-6 stat-glow">
            {/* Header with title and toggle */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">
                    {title}
                </h3>
                <div className="flex items-center gap-2 bg-navy-500 rounded-lg p-1">
                    <button
                        onClick={() => setView("combined")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            view === "combined"
                                ? "bg-boltz-primary text-navy-700"
                                : "text-text-secondary hover:text-text-primary"
                        }`}
                        title={strings.dashboard.combinedView}>
                        <Layers className="w-4 h-4" />
                        <span className="hidden sm:inline">
                            {strings.dashboard.combined}
                        </span>
                    </button>
                    <button
                        onClick={() => setView("separate")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            view === "separate"
                                ? "bg-boltz-primary text-navy-700"
                                : "text-text-secondary hover:text-text-primary"
                        }`}
                        title={strings.dashboard.separateView}>
                        <LayoutGrid className="w-4 h-4" />
                        <span className="hidden sm:inline">
                            {strings.dashboard.separate}
                        </span>
                    </button>
                </div>
            </div>

            {/* Chart content */}
            {view === "combined" ? (
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                {pairs.map((pair) => {
                                    const color = getPairColor(pair);
                                    return (
                                        <linearGradient
                                            key={pair}
                                            id={`gradient-${pair.replace(/[^a-zA-Z0-9]/g, "-")}`}
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor={color}
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor={color}
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    );
                                })}
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={CHART_COLORS.grid}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                tick={{
                                    fill: CHART_COLORS.axisTick,
                                    fontSize: 12,
                                }}
                                tickLine={false}
                                axisLine={{ stroke: CHART_COLORS.grid }}
                            />
                            <YAxis
                                tick={{
                                    fill: CHART_COLORS.axisTick,
                                    fontSize: 12,
                                }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={formatYAxis}
                            />
                            <Tooltip
                                content={
                                    <CustomTooltip
                                        formatChartValue={formatChartValue}
                                    />
                                }
                            />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingBottom: "10px" }}
                                formatter={(value) => (
                                    <span className="text-text-secondary text-sm">
                                        {value}
                                    </span>
                                )}
                            />
                            {pairs.map((pair) => {
                                const color = getPairColor(pair);
                                const gradientId = `gradient-${pair.replace(/[^a-zA-Z0-9]/g, "-")}`;
                                return (
                                    <Area
                                        key={pair}
                                        type="monotone"
                                        dataKey={pair}
                                        stroke={color}
                                        strokeWidth={2}
                                        fill={`url(#${gradientId})`}
                                        dot={false}
                                        activeDot={{
                                            fill: color,
                                            strokeWidth: 2,
                                            stroke: CHART_COLORS.activeDotStroke,
                                            r: 5,
                                        }}
                                    />
                                );
                            })}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pairs.map((pair) => {
                        const color = getPairColor(pair);
                        const singleChartData = data.map((item) => ({
                            label: `${item.month} ${item.year}`,
                            volume:
                                denomination === Denomination.SAT
                                    ? (item.pairVolume[pair] || 0) * 100_000_000
                                    : item.pairVolume[pair] || 0,
                        }));

                        return (
                            <SinglePairChart
                                key={pair}
                                pair={pair}
                                data={singleChartData}
                                color={color}
                                formatChartValue={formatChartValue}
                                formatYAxis={separateFormatYAxis}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
