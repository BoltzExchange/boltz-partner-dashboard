import { Layers, LayoutGrid } from "lucide-react";
import { Fragment, ReactNode, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    TooltipContentProps,
    TooltipPayloadEntry,
    XAxis,
    YAxis,
} from "recharts";

import { Denomination, useDenomination } from "../contexts/DenominationContext";
import { t } from "../i18n";
import { MonthlyStats } from "../utils/boltzApi";
import { CHART_COLORS } from "../utils/colors";
import { getPairColor } from "../utils/colors";
import { isCurrentMonth } from "../utils/date";

interface PairVolumeChartProps {
    data: MonthlyStats[];
    title: ReactNode;
}

interface ChartDataPoint {
    label: string;
    month: string;
    year: number;
    isCurrentMonth?: boolean;
    [pair: string]: string | number | boolean | null | undefined;
}

interface CustomTooltipProps extends Partial<
    TooltipContentProps<number, string>
> {
    pairs?: string[];
    formatChartValue: (value: number) => string;
}

interface PairChartDataPoint {
    label: string;
    volume: number;
    solidValue: number | null;
    dashedValue: number | null;
    isCurrentMonth?: boolean;
}

function getTooltipNumber(entry: TooltipPayloadEntry): number {
    return typeof entry.value === "number" ? entry.value : 0;
}

function getChartNumber(value: unknown): number {
    return typeof value === "number" ? value : 0;
}

function getSolidKey(pair: string): string {
    return `${pair}__solid`;
}

function getDashedKey(pair: string): string {
    return `${pair}__current`;
}

function CustomTooltip({
    active,
    payload,
    label,
    pairs,
    formatChartValue,
}: CustomTooltipProps) {
    const strings = t();
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as ChartDataPoint | undefined;
    const isCurrent = data?.isCurrentMonth === true;

    const validPayload = (pairs || [])
        .map((pair) => ({
            pair,
            value: data ? getChartNumber(data[pair]) : 0,
            color: isCurrent ? CHART_COLORS.axisTick : getPairColor(pair),
        }))
        .filter((entry) => entry.value > 0)
        .sort((a, b) => b.value - a.value);

    if (validPayload.length === 0) return null;

    const total = validPayload.reduce((sum, p) => sum + p.value, 0);
    const valueClass = isCurrent ? "text-text-muted" : "text-text-primary";

    return (
        <div className="bg-navy-700 border border-navy-400 rounded-xl p-4 shadow-xl">
            <p className="text-text-secondary text-sm mb-2">{label}</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
                {validPayload.map((entry, index) => {
                    const percentage =
                        total > 0 ? (entry.value / total) * 100 : 0;
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
                                    {entry.pair}
                                </span>
                            </div>
                            <div className="text-right">
                                <span
                                    className={`${valueClass} font-semibold mono-nums`}>
                                    {formatChartValue(entry.value)}
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
                    <span className={`${valueClass} font-semibold mono-nums`}>
                        {formatChartValue(total)}
                    </span>
                </div>
            </div>
        </div>
    );
}

interface SinglePairChartProps {
    pair: string;
    data: PairChartDataPoint[];
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
    const data = payload[0].payload as PairChartDataPoint | undefined;
    const value = data?.volume ?? getTooltipNumber(payload[0]);
    const valueClass = data?.isCurrentMonth
        ? "text-text-muted"
        : "text-text-primary";

    return (
        <div className="bg-navy-700 border border-navy-400 rounded-xl p-3 shadow-xl">
            <p className="text-text-secondary text-sm mb-1">{label}</p>
            <div className="flex items-center justify-between gap-4">
                <span className="text-text-secondary text-sm">{pair}</span>
                <span className={`font-semibold mono-nums ${valueClass}`}>
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
    const dashedGradientId = `${gradientId}-current`;
    const hasCurrentMonth = data.some((item) => item.isCurrentMonth);

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
                            <linearGradient
                                id={dashedGradientId}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1">
                                <stop
                                    offset="5%"
                                    stopColor={CHART_COLORS.axisTick}
                                    stopOpacity={0.2}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={CHART_COLORS.axisTick}
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
                            dataKey="solidValue"
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
                            connectNulls={false}
                        />
                        {hasCurrentMonth && (
                            <Area
                                type="monotone"
                                dataKey="dashedValue"
                                stroke={CHART_COLORS.axisTick}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fill={`url(#${dashedGradientId})`}
                                dot={false}
                                activeDot={(props: {
                                    cx?: number;
                                    cy?: number;
                                    payload?: { isCurrentMonth?: boolean };
                                }) => {
                                    if (!props.payload?.isCurrentMonth) {
                                        return (
                                            <g
                                                key={`activedot-hidden-${props.cx}`}
                                            />
                                        );
                                    }

                                    return (
                                        <circle
                                            key={`activedot-current-${props.cx}`}
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={4}
                                            fill={CHART_COLORS.axisTick}
                                            stroke={
                                                CHART_COLORS.activeDotStroke
                                            }
                                            strokeWidth={2}
                                        />
                                    );
                                }}
                                connectNulls={false}
                            />
                        )}
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
    const currentMonthIndex = data.findIndex((item) =>
        isCurrentMonth(item.month, item.year),
    );
    const hasCurrentMonth = currentMonthIndex >= 0;

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
    const chartData: ChartDataPoint[] = data.map((item, index) => {
        const point: ChartDataPoint = {
            label: `${item.month} ${item.year}`,
            month: item.month,
            year: item.year,
            isCurrentMonth: isCurrentMonth(item.month, item.year),
        };

        pairs.forEach((pair) => {
            const volume = item.pairVolume[pair] || 0;
            const displayVolume =
                denomination === Denomination.SAT
                    ? volume * 100_000_000
                    : volume;
            const isPrevToCurrent =
                hasCurrentMonth && index === currentMonthIndex - 1;

            point[pair] = displayVolume;
            point[getSolidKey(pair)] =
                !hasCurrentMonth || index < currentMonthIndex
                    ? displayVolume
                    : isPrevToCurrent
                      ? displayVolume
                      : null;
            point[getDashedKey(pair)] =
                point.isCurrentMonth || isPrevToCurrent ? displayVolume : null;
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
                                        <Fragment key={pair}>
                                            <linearGradient
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
                                            <linearGradient
                                                id={`gradient-current-${pair.replace(/[^a-zA-Z0-9]/g, "-")}`}
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1">
                                                <stop
                                                    offset="5%"
                                                    stopColor={
                                                        CHART_COLORS.axisTick
                                                    }
                                                    stopOpacity={0.2}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor={
                                                        CHART_COLORS.axisTick
                                                    }
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </Fragment>
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
                                        pairs={pairs}
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
                                const dashedGradientId = `gradient-current-${pair.replace(/[^a-zA-Z0-9]/g, "-")}`;
                                return (
                                    <Fragment key={pair}>
                                        <Area
                                            type="monotone"
                                            dataKey={getSolidKey(pair)}
                                            name={pair}
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
                                            connectNulls={false}
                                        />
                                        {hasCurrentMonth && (
                                            <Area
                                                type="monotone"
                                                dataKey={getDashedKey(pair)}
                                                stroke={CHART_COLORS.axisTick}
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                fill={`url(#${dashedGradientId})`}
                                                dot={false}
                                                activeDot={(props: {
                                                    cx?: number;
                                                    cy?: number;
                                                    payload?: {
                                                        isCurrentMonth?: boolean;
                                                    };
                                                }) => {
                                                    if (
                                                        !props.payload
                                                            ?.isCurrentMonth
                                                    ) {
                                                        return (
                                                            <g
                                                                key={`activedot-hidden-${pair}-${props.cx}`}
                                                            />
                                                        );
                                                    }

                                                    return (
                                                        <circle
                                                            key={`activedot-current-${pair}-${props.cx}`}
                                                            cx={props.cx}
                                                            cy={props.cy}
                                                            r={5}
                                                            fill={
                                                                CHART_COLORS.axisTick
                                                            }
                                                            stroke={
                                                                CHART_COLORS.activeDotStroke
                                                            }
                                                            strokeWidth={2}
                                                        />
                                                    );
                                                }}
                                                legendType="none"
                                                connectNulls={false}
                                            />
                                        )}
                                    </Fragment>
                                );
                            })}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pairs.map((pair) => {
                        const color = getPairColor(pair);
                        const singleChartData = data.map((item, index) => {
                            const volume =
                                denomination === Denomination.SAT
                                    ? (item.pairVolume[pair] || 0) * 100_000_000
                                    : item.pairVolume[pair] || 0;
                            const isCurrent = isCurrentMonth(
                                item.month,
                                item.year,
                            );
                            const isPrevToCurrent =
                                hasCurrentMonth &&
                                index === currentMonthIndex - 1;

                            return {
                                label: `${item.month} ${item.year}`,
                                volume,
                                isCurrentMonth: isCurrent,
                                solidValue:
                                    !hasCurrentMonth ||
                                    index < currentMonthIndex
                                        ? volume
                                        : isPrevToCurrent
                                          ? volume
                                          : null,
                                dashedValue:
                                    isCurrent || isPrevToCurrent
                                        ? volume
                                        : null,
                            };
                        });

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
