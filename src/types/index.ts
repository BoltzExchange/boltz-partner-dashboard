export interface Partner {
    name: string;
    apiKey: string;
    apiSecret: string;
}

export interface ReferralStats {
    allTime: {
        volumeBtc: number;
        swapCount: number;
        avgSwapSize: number;
    };
    monthly: MonthlyStats[];
}

export interface MonthlyStats {
    month: string;
    year: number;
    volumeBtc: number;
    swapCount: number;
    avgSwapSize: number;
    volumeChange?: number;
    swapChange?: number;
}

export interface SwapStats {
    type: string;
    count: number;
    volume: number;
}

export interface AuthState {
    isAuthenticated: boolean;
    partner: Partner | null;
    isLoading: boolean;
}
