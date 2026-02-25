const PAIR_COLORS: Record<string, string> = {
    "BTC/BTC": "#f7931a",
    "L-BTC/BTC": "#4fadc2",
    "RBTC/BTC": "#6b8e23",
    "BTC/RBTC": "#9370db",
    "L-BTC/RBTC": "#ff6b6b",
};

const DEFAULT_COLORS = [
    "#e8cb2b",
    "#4fadc2",
    "#f7931a",
    "#9370db",
    "#ff6b6b",
    "#6b8e23",
];

function fallbackColorIndex(pair: string): number {
    let hash = 0;
    for (let i = 0; i < pair.length; i += 1) {
        hash = (hash * 31 + pair.charCodeAt(i)) >>> 0;
    }
    return hash % DEFAULT_COLORS.length;
}

export function getPairColor(pair: string, _index?: number): string {
    const normalizedPair = pair.trim().toUpperCase();
    if (PAIR_COLORS[normalizedPair]) {
        return PAIR_COLORS[normalizedPair];
    }

    const [from, to] = normalizedPair.split("/");
    if (from && to) {
        const reversedPair = `${to}/${from}`;
        if (PAIR_COLORS[reversedPair]) {
            return PAIR_COLORS[reversedPair];
        }
    }

    // Deterministic fallback so color does not change by list/order.
    return DEFAULT_COLORS[fallbackColorIndex(normalizedPair)];
}
