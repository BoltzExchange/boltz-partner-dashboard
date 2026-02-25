import { DEFAULT_PAIR_COLORS, PAIR_COLORS } from "./chartTheme";

function fallbackColorIndex(pair: string): number {
    let hash = 0;
    for (let i = 0; i < pair.length; i += 1) {
        hash = (hash * 31 + pair.charCodeAt(i)) >>> 0;
    }
    return hash % DEFAULT_PAIR_COLORS.length;
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
    return DEFAULT_PAIR_COLORS[fallbackColorIndex(normalizedPair)];
}
