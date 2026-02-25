import { ReactNode } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from "recharts";

import { Denomination, useDenomination } from "../contexts/DenominationContext";
import { t } from "../i18n";
import { MonthlyStats } from "../utils/boltzApi";
import { CHART_COLORS } from "../utils/chartTheme";
import { isCurrentMonth } from "../utils/date";

interface PerformanceChartProps {
    data: MonthlyStats[];
    dataKey: "volumeBtc" | "swapCount" | "avgSwapSize";
    title: ReactNode;
    color?: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
    dataKey: string;
    formatValue: (btc: number) => string;
    formatSats: (sats: number) => string;
}

interface ChartDataPoint extends MonthlyStats {
    isCurrentMonth?: boolean;
}

function CustomTooltip({
    active,
    payload,
    label,
    dataKey,
    formatValue,
    formatSats,
}: CustomTooltipProps) {
    const strings = t();
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as ChartDataPoint;
    const isCurrent = data.isCurrentMonth === true;

    const getFormattedValue = () => {
        switch (dataKey) {
            case "volumeBtc":
                return formatValue(data.volumeBtc);
            case "swapCount":
                return `${data.swapCount.toLocaleString()} ${strings.common.swaps}`;
            case "avgSwapSize":
                return formatSats(data.avgSwapSize);
            default:
                return String(payload[0].value);
        }
    };

    const getChangeValue = () => {
        if (dataKey === "avgSwapSize") return null;
        return dataKey === "volumeBtc" ? data.volumeChange : data.swapChange;
    };

    const change = getChangeValue();

    const getChangeColorClass = () => {
        if (isCurrent) return "text-text-muted";
        return change !== undefined && change !== null && change >= 0
            ? "text-boltz-primary"
            : "text-red-400";
    };

    return (
        <div className="bg-navy-700 border border-navy-400 rounded-xl p-4 shadow-xl">
            <p className="text-text-secondary text-sm mb-2">
                {label} {data.year}
            </p>
            <div className="space-y-1">
                <p
                    className={`font-semibold mono-nums ${isCurrent ? "text-text-muted" : "text-text-primary"}`}>
                    {getFormattedValue()}
                </p>
                {change !== undefined && change !== null && (
                    <p className={`text-sm ${getChangeColorClass()}`}>
                        {change >= 0 ? "+" : ""}
                        {change.toFixed(1)}% {strings.common.fromPrev}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function PerformanceChart({
    data,
    dataKey,
    title,
    color = CHART_COLORS.primary,
}: PerformanceChartProps) {
    const { denomination, formatValue, formatSats } = useDenomination();

    const currentMonthIndex = data.findIndex((item) =>
        isCurrentMonth(item.month, item.year),
    );
    const hasCurrentMonth = currentMonthIndex >= 0;

    const chartData = data.map((item, index) => {
        const baseValue =
            dataKey === "volumeBtc" && denomination === Denomination.SAT
                ? item.volumeBtc * 100_000_000
                : item[dataKey];

        const isCurrent = isCurrentMonth(item.month, item.year);
        const isPrevToCurrent =
            hasCurrentMonth && index === currentMonthIndex - 1;

        return {
            ...item,
            label: `${item.month} ${item.year}`,
            volumeDisplay:
                denomination === Denomination.SAT
                    ? item.volumeBtc * 100_000_000
                    : item.volumeBtc,
            isCurrentMonth: isCurrent,
            solidValue:
                !hasCurrentMonth || index < currentMonthIndex
                    ? baseValue
                    : isPrevToCurrent
                      ? baseValue
                      : null,
            dashedValue: isCurrent || isPrevToCurrent ? baseValue : null,
        };
    });

    const formatYAxis = (value: number) => {
        switch (dataKey) {
            case "volumeBtc":
                if (denomination === Denomination.SAT) {
                    if (value >= 1_000_000_000)
                        return `${(value / 1_000_000_000).toFixed(1)}B`;
                    if (value >= 1_000_000)
                        return `${(value / 1_000_000).toFixed(1)}M`;
                    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
                    return value.toLocaleString();
                }
                return `${value.toFixed(2)}`;
            case "swapCount":
                return value.toLocaleString();
            case "avgSwapSize":
                if (denomination === Denomination.BTC) {
                    const btc = value / 100_000_000;
                    return btc.toFixed(4);
                }
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return value.toLocaleString();
            default:
                return String(value);
        }
    };

    const gradientId = `colorGradient-${dataKey}`;
    const dashedGradientId = `colorGradientDashed-${dataKey}`;

    return (
        <div className="bg-navy-600/60 backdrop-blur-sm border border-navy-400/50 rounded-2xl p-6 stat-glow">
            <h3 className="text-lg font-semibold text-text-primary mb-6">
                {title}
            </h3>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                            tick={{ fill: CHART_COLORS.axisTick, fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: CHART_COLORS.grid }}
                        />
                        <YAxis
                            tick={{ fill: CHART_COLORS.axisTick, fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatYAxis}
                        />
                        <Tooltip
                            content={
                                <CustomTooltip
                                    dataKey={dataKey}
                                    formatValue={formatValue}
                                    formatSats={formatSats}
                                />
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="solidValue"
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                            dot={{ fill: color, strokeWidth: 0, r: 4 }}
                            activeDot={{
                                fill: color,
                                strokeWidth: 2,
                                stroke: CHART_COLORS.activeDotStroke,
                                r: 6,
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
                                dot={(props: {
                                    cx?: number;
                                    cy?: number;
                                    payload?: { isCurrentMonth?: boolean };
                                }) => {
                                    if (!props.payload?.isCurrentMonth)
                                        return (
                                            <g key={`dot-hidden-${props.cx}`} />
                                        );
                                    return (
                                        <circle
                                            key={`dot-current-${props.cx}`}
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={4}
                                            fill={CHART_COLORS.axisTick}
                                        />
                                    );
                                }}
                                activeDot={(props: {
                                    cx?: number;
                                    cy?: number;
                                    payload?: { isCurrentMonth?: boolean };
                                }) => {
                                    if (!props.payload?.isCurrentMonth)
                                        return (
                                            <g
                                                key={`activedot-hidden-${props.cx}`}
                                            />
                                        );
                                    return (
                                        <circle
                                            key={`activedot-current-${props.cx}`}
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={6}
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
