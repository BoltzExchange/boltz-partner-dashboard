export const translations = {
    en: {
        common: {
            poweredBy: "Powered by",
            boltz: "Boltz",
            signOut: "Sign Out",
            tryAgain: "Try Again",
            back: "Back",
            btc: "BTC",
            sats: "sats",
            inBtc: "in BTC",
            inSats: "in sats",
            swaps: "swaps",
            fromPrev: "from prev",
            total: "Total",
            comingSoon: "Coming Soon",
        },
        login: {
            title: "Partner Dashboard",
            subtitle: "Sign in with your Boltz API credentials",
            apiKey: "API Key",
            apiSecret: "API Secret",
            apiKeyPlaceholder: "Enter your API Key",
            apiSecretPlaceholder: "Enter your API Secret",
            authenticating: "Authenticating...",
            accessDashboard: "Access Dashboard",
            securityNote:
                "🔒 Your credentials are stored locally and never leave your browser.",
            errorBothRequired: "Please enter both API Key and API Secret",
            errorInvalidCredentials:
                "Invalid credentials. Please check your API Key and Secret.",
        },
        dashboard: {
            title: "Partner Dashboard",
            loadingStats: "Loading your stats...",
            unableToLoadData: "Unable to Load Data",
            errorLoadingStats:
                "Failed to load stats. Please check your credentials and try again.",
            refreshData: "Refresh data",
            toggleDenomination: "Toggle denomination",
            totalVolume: "Total Volume",
            allTimeSwapVolume: "All-time swap volume",
            totalSwaps: "Total Swap Count",
            completedSwaps: "Completed swaps",
            avgSwapSize: "Average Swap Size",
            perSwap: "Per swap",
            volumeOverTime: "Volume",
            swapCountOverTime: "Swap Count",
            avgSwapSizeOverTime: "Average Swap Size",
            noDataYet: "No Data Yet",
            noDataDescription:
                "Once your referral link starts generating swaps, your stats will appear here.",
            volumeByPair: "Volume by Pair",
            swapFailureRates: "Failure Rates by Type",
            combinedView: "Combined view - all pairs in one chart",
            separateView: "Separate view - individual charts per pair",
            combined: "Combined",
            separate: "Separate",
            noPairData: "No pair data available",
            noFailureData:
                "No failure rate data available. This metric will appear once Boltz collects enough swap statistics.",
        },
        table: {
            monthlyBreakdown: "Monthly Breakdown",
            month: "Month",
            volume: "Volume",
            volumeDelta: "Volume Δ",
            swaps: "Swaps",
            swapsDelta: "Swaps Δ",
            avgSize: "Avg Size",
            pair: "Pair",
            share: "Share",
        },
        charts: {
            swapTypes: {
                submarine: "Submarine",
                reverse: "Reverse",
                chain: "Chain",
            },
        },
        monthDetail: {
            title: "Details",
            loading: "Loading month details...",
            notFound: "Month not found",
            tryAgain: "Please go back and select a valid month from the table.",
            vsAvg: "avg:",
            failureRates: "Failure Rates by Type",
            pairDistribution: "Volume Distribution by Pair",
            volume: "Volume",
            swaps: "Swaps",
            avgSwapSize: "Average Swap Size",
            volumeByPair: "Volume by Pair",
            avg: "Avg",
        },
        format: {
            percentZero: "0%",
        },
    },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKeys = typeof translations.en;

const currentLocale: Locale = "en";

export function t(): TranslationKeys {
    return translations[currentLocale];
}

export const en = translations.en;
