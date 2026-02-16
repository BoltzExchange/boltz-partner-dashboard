export const translations = {
    en: {
        common: {
            poweredBy: "Powered by",
            boltz: "Boltz",
            signOut: "Sign Out",
            tryAgain: "Try Again",
            btc: "BTC",
            sats: "sats",
            swaps: "swaps",
            fromPrev: "from prev",
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
            totalSwaps: "Total Number of Swaps",
            completedSwaps: "Completed swaps",
            avgSwapSize: "Average Swap Size",
            perSwap: "Per swap",
            volumeOverTime: "Volume Over Time",
            swapCountOverTime: "Swap Count Over Time",
            avgSwapSizeOverTime: "Average Swap Size",
            noDataYet: "No Data Yet",
            noDataDescription:
                "Once your referral link starts generating swaps, your stats will appear here.",
        },
        table: {
            monthlyBreakdown: "Monthly Breakdown",
            month: "Month",
            volume: "Volume",
            volumeDelta: "Volume Δ",
            swaps: "Swaps",
            swapsDelta: "Swaps Δ",
            avgSize: "Avg Size",
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
