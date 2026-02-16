import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

import { useDenomination } from "../contexts/DenominationContext";
import { t } from "../i18n";
import { MonthlyStats } from "../types";

interface MonthlyTableProps {
    data: MonthlyStats[];
}

type SortField =
    | "date"
    | "volume"
    | "volumeChange"
    | "swaps"
    | "swapChange"
    | "avgSize";
type SortDirection = "asc" | "desc";

const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function isCurrentMonth(month: string, year: number): boolean {
    const now = new Date();
    const currentMonthName = MONTH_NAMES[now.getMonth()];
    const currentYear = now.getFullYear();
    return month === currentMonthName && year === currentYear;
}

function getMonthIndex(month: string): number {
    return MONTH_NAMES.indexOf(month);
}

function ChangeIndicator({
    value,
    muted = false,
}: {
    value?: number;
    muted?: boolean;
}) {
    const strings = t();
    if (value === undefined) {
        return (
            <span className="text-sm font-medium text-text-muted">
                {strings.format.percentZero}
            </span>
        );
    }

    const isPositive = value > 0;
    const isNegative = value < 0;

    const colorClass = muted
        ? "text-text-muted"
        : isPositive
          ? "text-boltz-primary"
          : isNegative
            ? "text-red-400"
            : "text-text-muted";

    return (
        <span
            className={`inline-flex items-center gap-1 text-sm font-medium ${colorClass}`}>
            {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
            {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
            {isPositive && "+"}
            {value.toFixed(1)}%
        </span>
    );
}

interface SortHeaderProps {
    label: string;
    field: SortField;
    currentSort: SortField;
    direction: SortDirection;
    onSort: (field: SortField) => void;
    align?: "left" | "right";
}

function SortHeader({
    label,
    field,
    currentSort,
    direction,
    onSort,
    align = "right",
}: SortHeaderProps) {
    const isActive = currentSort === field;

    return (
        <th
            className={`text-${align} text-text-secondary text-sm font-medium px-6 py-4 cursor-pointer hover:text-text-primary transition-colors select-none`}
            onClick={() => onSort(field)}>
            <div
                className={`inline-flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
                <span>{label}</span>
                <span className={`w-4 h-4 ${isActive ? "" : "invisible"}`}>
                    {direction === "asc" ? (
                        <ChevronUp className="w-4 h-4 text-boltz-primary" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-boltz-primary" />
                    )}
                </span>
            </div>
        </th>
    );
}

export default function MonthlyTable({ data }: MonthlyTableProps) {
    const { formatValue, formatSats } = useDenomination();
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const strings = t();

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const sortedData = [...data].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
            case "date":
                const dateA = a.year * 12 + getMonthIndex(a.month);
                const dateB = b.year * 12 + getMonthIndex(b.month);
                comparison = dateA - dateB;
                break;
            case "volume":
                comparison = a.volumeBtc - b.volumeBtc;
                break;
            case "volumeChange":
                comparison = (a.volumeChange ?? 0) - (b.volumeChange ?? 0);
                break;
            case "swaps":
                comparison = a.swapCount - b.swapCount;
                break;
            case "swapChange":
                comparison = (a.swapChange ?? 0) - (b.swapChange ?? 0);
                break;
            case "avgSize":
                comparison = a.avgSwapSize - b.avgSwapSize;
                break;
        }

        return sortDirection === "asc" ? comparison : -comparison;
    });

    return (
        <div className="bg-navy-600/60 backdrop-blur-sm border border-text-muted/20 rounded-2xl overflow-hidden stat-glow">
            <div className="p-6 border-b border-text-muted/20">
                <h3 className="text-lg font-semibold text-text-primary">
                    {strings.table.monthlyBreakdown}
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <colgroup>
                        <col className="w-[15%]" />
                        <col className="w-[20%]" />
                        <col className="w-[13%]" />
                        <col className="w-[12%]" />
                        <col className="w-[13%]" />
                        <col className="w-[20%]" />
                    </colgroup>
                    <thead>
                        <tr className="bg-text-muted/10">
                            <SortHeader
                                label={strings.table.month}
                                field="date"
                                currentSort={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                                align="left"
                            />
                            <SortHeader
                                label={strings.table.volume}
                                field="volume"
                                currentSort={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                            <SortHeader
                                label={strings.table.volumeDelta}
                                field="volumeChange"
                                currentSort={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                            <SortHeader
                                label={strings.table.swaps}
                                field="swaps"
                                currentSort={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                            <SortHeader
                                label={strings.table.swapsDelta}
                                field="swapChange"
                                currentSort={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                            <SortHeader
                                label={strings.table.avgSize}
                                field="avgSize"
                                currentSort={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((month, index) => {
                            const isCurrent = isCurrentMonth(
                                month.month,
                                month.year,
                            );
                            const isEven = index % 2 === 0;
                            return (
                                <tr
                                    key={`${month.month}-${month.year}`}
                                    className={`border-t border-text-muted/10 hover:bg-boltz-primary/5 transition-colors
                    ${isCurrent ? "bg-text-muted/5" : isEven ? "bg-text-muted/[0.02]" : ""}`}>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`font-medium ${isCurrent ? "text-text-muted" : "text-text-primary"}`}>
                                            {month.month} {month.year}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span
                                            className={`font-semibold mono-nums whitespace-nowrap ${isCurrent ? "text-text-muted" : "text-text-primary"}`}>
                                            {formatValue(month.volumeBtc)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ChangeIndicator
                                            value={month.volumeChange}
                                            muted={isCurrent}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span
                                            className={`font-semibold mono-nums whitespace-nowrap ${isCurrent ? "text-text-muted" : "text-text-primary"}`}>
                                            {month.swapCount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ChangeIndicator
                                            value={month.swapChange}
                                            muted={isCurrent}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span
                                            className={`mono-nums whitespace-nowrap ${isCurrent ? "text-text-muted" : "text-text-secondary"}`}>
                                            {formatSats(month.avgSwapSize)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
