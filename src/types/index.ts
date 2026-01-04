export interface Partner {
  id: string;
  name: string;
  apiKey: string;
  apiSecret: string;
}

export interface ReferralStats {
  allTime: {
    volumeBtc: number;
    tradeCount: number;
    avgTradeSize: number;
    feesEarnedSats: number;
  };
  monthly: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  year: number;
  volumeBtc: number;
  tradeCount: number;
  avgTradeSize: number;
  feesEarnedSats: number;
  volumeChange?: number;
  tradeChange?: number;
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
