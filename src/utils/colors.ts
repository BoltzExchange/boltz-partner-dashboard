export const colors = {
    boltz: {
        primary: "#e8cb2b",
        "primary-light": "#fee86b",
        link: "#4fadc2",
        "link-hover": "#70cde2",
    },
    navy: {
        50: "#d0d4d9",
        100: "#a1a9b2",
        200: "#727e8c",
        300: "#1e2d3c",
        400: "#17222e",
        500: "#12253a",
        600: "#0f1f30",
        700: "#091625",
        800: "#09141f",
        900: "#081E36",
    },
    text: {
        primary: "#d7dee4",
        secondary: "#a1a9b2",
        muted: "#727e8c",
    },
    chart: {
        bitcoin: "#f7931a",
        chain: "#e74c3c",
        olive: "#6b8e23",
        purple: "#9370db",
        coral: "#ff6b6b",
        teal: "#56a8a1",
        gold: "#d4a04a",
        steel: "#5e81ac",
    },
} as const;

export const CHART_COLORS = {
    primary: colors.boltz.primary,
    grid: colors.navy[300],
    axisTick: colors.navy[200],
    activeDotStroke: colors.navy[700],
    tooltipCursor: "rgba(30, 45, 60, 0.35)",
} as const;

export const SWAP_TYPE_COLORS = {
    submarine: colors.boltz.link,
    reverse: colors.chart.bitcoin,
    chain: colors.chart.chain,
} as const;

export const FAILURE_RATE_COLORS = {
    submarine: colors.chart.teal,
    reverse: colors.chart.gold,
    chain: colors.chart.steel,
} as const;

export const PAIR_COLORS: Record<string, string> = {
    "BTC/BTC": colors.chart.bitcoin,
    "L-BTC/BTC": colors.boltz.link,
    "RBTC/BTC": colors.chart.olive,
    "BTC/RBTC": colors.chart.purple,
    "L-BTC/RBTC": colors.chart.coral,
};

export function getPairColor(pair: string): string {
    const key = pair.trim().toUpperCase();

    if (PAIR_COLORS[key]) return PAIR_COLORS[key];

    const [from, to] = key.split("/");
    if (from && to) {
        const reversed = `${to}/${from}`;
        if (PAIR_COLORS[reversed]) return PAIR_COLORS[reversed];
    }

    return colors.boltz.primary;
}
