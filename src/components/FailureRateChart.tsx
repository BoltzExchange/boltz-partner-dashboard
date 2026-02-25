import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from "recharts";

import { t } from "../i18n";
import { MonthlyStats } from "../utils/boltzApi";
import { CHART_COLORS, FAILURE_RATE_COLORS } from "../utils/colors";
import { getSwapTypeLabelMap } from "../utils/swapTypes";

interface FailureRateChartProps {
    data: MonthlyStats[];
    title: string;
}

interface ChartDataPoint {
    label: string;
    month: string;
    year: number;
    submarine: number;
    reverse: number;
    chain: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    const strings = t();
    const labelMap = getSwapTypeLabelMap(strings);

    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-navy-700 border border-navy-400 rounded-xl p-4 shadow-xl">
            <p className="text-text-secondary text-sm mb-2">{label}</p>
            <div className="space-y-1">
                {payload.map((entry, index) => {
                    const swapType =
                        entry.dataKey as keyof typeof FAILURE_RATE_COLORS;
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
                                    {labelMap[swapType] || swapType}
                                </span>
                            </div>
                            <span className="text-text-primary font-semibold mono-nums">
                                {((entry.value || 0) * 100).toFixed(1)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function FailureRateChart({
    data,
    title,
}: FailureRateChartProps) {
    const strings = t();
    const labelMap = getSwapTypeLabelMap(strings);

    // Transform data for the chart
    const chartData: ChartDataPoint[] = data.map((item) => ({
        label: `${item.month} ${item.year}`,
        month: item.month,
        year: item.year,
        submarine: item.failureRates.submarine,
        reverse: item.failureRates.reverse,
        chain: item.failureRates.chain,
    }));

    const formatYAxis = (value: number) => {
        return `${(value * 100).toFixed(0)}%`;
    };

    // Check if there's any failure rate data
    const hasFailureData = data.some(
        (item) =>
            item.failureRates.submarine > 0 ||
            item.failureRates.reverse > 0 ||
            item.failureRates.chain > 0,
    );

    if (!hasFailureData) {
        return (
            <div className="bg-navy-600/60 backdrop-blur-sm border border-navy-400/50 rounded-2xl p-6 stat-glow">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                    {title}
                </h3>
                <div className="h-72 flex items-center justify-center">
                    <p className="text-text-muted text-center px-8">
                        {strings.dashboard.noFailureData}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-navy-600/60 backdrop-blur-sm border border-navy-400/50 rounded-2xl p-6 stat-glow">
            <h3 className="text-lg font-semibold text-text-primary mb-6">
                {title}
            </h3>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        barGap={4}>
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
                            domain={[0, "auto"]}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: CHART_COLORS.tooltipCursor }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ paddingBottom: "10px" }}
                            formatter={(value) => {
                                return (
                                    <span className="text-text-secondary text-sm">
                                        {labelMap[
                                            value as keyof typeof labelMap
                                        ] || value}
                                    </span>
                                );
                            }}
                        />
                        <Bar
                            dataKey="submarine"
                            fill={FAILURE_RATE_COLORS.submarine}
                            radius={[2, 2, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="reverse"
                            fill={FAILURE_RATE_COLORS.reverse}
                            radius={[2, 2, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="chain"
                            fill={FAILURE_RATE_COLORS.chain}
                            radius={[2, 2, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
