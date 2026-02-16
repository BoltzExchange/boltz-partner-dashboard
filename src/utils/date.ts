export const MONTH_NAMES = [
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

export function getMonthName(month: number): string {
    return MONTH_NAMES[month - 1] || "Unknown";
}

export function getMonthIndex(month: string): number {
    return MONTH_NAMES.indexOf(month);
}

export function isCurrentMonth(month: string, year: number): boolean {
    const now = new Date();
    const currentMonthName = MONTH_NAMES[now.getMonth()];
    const currentYear = now.getFullYear();
    return month === currentMonthName && year === currentYear;
}
