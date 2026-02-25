export const CHART_COLORS = {
    primary: "#e8cb2b",
    grid: "#1e2d3c",
    axisTick: "#727e8c",
    activeDotStroke: "#091625",
    tooltipCursor: "rgba(30, 45, 60, 0.35)",
} as const;

export const SWAP_TYPE_COLORS = {
    submarine: "#4fadc2",
    reverse: "#f7931a",
    chain: "#e74c3c",
} as const;

export const FAILURE_RATE_COLORS = {
    submarine: "#56a8a1",
    reverse: "#d4a04a",
    chain: "#5e81ac",
} as const;

export const PAIR_COLORS: Record<string, string> = {
    "BTC/BTC": "#f7931a",
    "L-BTC/BTC": "#4fadc2",
    "RBTC/BTC": "#6b8e23",
    "BTC/RBTC": "#9370db",
    "L-BTC/RBTC": "#ff6b6b",
};

export const DEFAULT_PAIR_COLORS = [
    "#e8cb2b",
    "#4fadc2",
    "#f7931a",
    "#9370db",
    "#ff6b6b",
    "#6b8e23",
];
