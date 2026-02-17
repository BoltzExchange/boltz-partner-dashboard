import { getMonthIndex, getMonthName } from "./date";

export interface MonthlyStats {
    month: string;
    year: number;
    volumeBtc: number;
    swapCount: number;
    avgSwapSize: number;
    volumeChange?: number;
    swapChange?: number;
}

export interface ReferralStats {
    allTime: {
        volumeBtc: number;
        swapCount: number;
        avgSwapSize: number;
    };
    monthly: MonthlyStats[];
}

const API_BASE = "https://api.boltz.exchange";

// Helper function to create HMAC SHA256 signature
async function createHmac(message: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Stats data structure from Boltz API
interface BoltzStatsData {
    [year: string]: {
        [month: string]: {
            volume?: {
                total?: string;
                [key: string]: string | undefined;
            };
            trades?: {
                total?: number;
                [key: string]: number | undefined;
            };
            groups?: {
                [partnerId: string]: {
                    volume?: { total?: string };
                    trades?: { total?: number };
                };
            };
        };
    };
}

async function buildAuthHeaders(
    apiKey: string,
    apiSecret: string,
    method: string,
    path: string,
): Promise<Record<string, string>> {
    const ts = Math.round(new Date().getTime() / 1000);
    const message = `${ts}${method}${path}`;
    const hmac = await createHmac(message, apiSecret);

    return {
        TS: ts.toString(),
        "API-KEY": apiKey,
        "API-HMAC": hmac,
    };
}

// Authenticated endpoint - uses HMAC with API Key + Secret
export async function fetchReferralStatsAuthenticated(
    apiKey: string,
    apiSecret: string,
): Promise<ReferralStats> {
    const path = "/v2/referral/stats";
    const headers = await buildAuthHeaders(apiKey, apiSecret, "GET", path);

    const response = await fetch(`${API_BASE}${path}`, { headers });

    const responseText = await response.text();

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${responseText}`);
    }

    let data: BoltzStatsData;
    try {
        data = JSON.parse(responseText);
    } catch {
        throw new Error("Invalid response from API");
    }

    return processStatsData(data);
}

// Fetch the referral ID (name) for the authenticated partner
export async function fetchReferralId(
    apiKey: string,
    apiSecret: string,
): Promise<string> {
    const path = "/v2/referral";
    const headers = await buildAuthHeaders(apiKey, apiSecret, "GET", path);

    const response = await fetch(`${API_BASE}${path}`, { headers });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
}

// Validate API credentials by making an authenticated request
export async function validateCredentials(
    apiKey: string,
    apiSecret: string,
): Promise<boolean> {
    try {
        const path = "/v2/referral/stats";
        const headers = await buildAuthHeaders(apiKey, apiSecret, "GET", path);

        const response = await fetch(`${API_BASE}${path}`, { headers });
        return response.ok;
    } catch {
        return false;
    }
}

function processStatsData(statsData: BoltzStatsData): ReferralStats {
    const monthlyData: MonthlyStats[] = [];

    Object.entries(statsData).forEach(([year, yearData]) => {
        Object.entries(yearData).forEach(([month, monthData]) => {
            const yearNum = parseInt(year);
            const monthNum = parseInt(month);

            const volumeBtc = parseFloat(monthData.volume?.total || "0");
            const swapCount = monthData.trades?.total || 0;

            if (swapCount > 0 || volumeBtc > 0) {
                const avgSwapSize =
                    swapCount > 0
                        ? Math.round((volumeBtc * 100_000_000) / swapCount)
                        : 0;

                monthlyData.push({
                    month: getMonthName(monthNum),
                    year: yearNum,
                    volumeBtc,
                    swapCount,
                    avgSwapSize,
                });
            }
        });
    });

    monthlyData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return getMonthIndex(a.month) - getMonthIndex(b.month);
    });

    for (let i = 1; i < monthlyData.length; i++) {
        const prev = monthlyData[i - 1];
        monthlyData[i].volumeChange =
            prev.volumeBtc > 0
                ? ((monthlyData[i].volumeBtc - prev.volumeBtc) /
                      prev.volumeBtc) *
                  100
                : 0;
        monthlyData[i].swapChange =
            prev.swapCount > 0
                ? ((monthlyData[i].swapCount - prev.swapCount) /
                      prev.swapCount) *
                  100
                : 0;
    }

    const allTime = {
        volumeBtc: monthlyData.reduce((sum, m) => sum + m.volumeBtc, 0),
        swapCount: monthlyData.reduce((sum, m) => sum + m.swapCount, 0),
        avgSwapSize: 0,
    };

    allTime.avgSwapSize =
        allTime.swapCount > 0
            ? Math.round((allTime.volumeBtc * 100_000_000) / allTime.swapCount)
            : 0;

    return { allTime, monthly: monthlyData };
}
