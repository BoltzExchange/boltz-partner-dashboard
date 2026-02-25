import { SWAP_TYPE_COLORS } from "./chartTheme";

export type SwapType = keyof typeof SWAP_TYPE_COLORS;

interface SwapTypeStrings {
    charts: {
        swapTypes: Record<SwapType, string>;
    };
}

export function getSwapTypeLabelMap(
    strings: SwapTypeStrings,
): Record<SwapType, string> {
    return {
        submarine: strings.charts.swapTypes.submarine,
        reverse: strings.charts.swapTypes.reverse,
        chain: strings.charts.swapTypes.chain,
    };
}
