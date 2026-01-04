import { ReferralStats, MonthlyStats } from '../types';

const API_BASE = 'https://api.boltz.exchange';

// Helper function to create HMAC SHA256 signature
async function createHmac(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

// Authenticated endpoint - uses HMAC with API Key + Secret
export async function fetchReferralStatsAuthenticated(apiKey: string, apiSecret: string): Promise<ReferralStats> {
  const path = '/v2/referral/stats';
  const ts = Math.round(new Date().getTime() / 1000);
  const method = 'GET';
  
  const message = `${ts}${method}${path}`;
  
  console.log('=== Fetching /v2/referral/stats ===');
  console.log('Timestamp:', ts);
  console.log('Path:', path);
  
  const hmac = await createHmac(message, apiSecret);
  
  const headers: Record<string, string> = {
    'TS': ts.toString(),
    'API-KEY': apiKey,
    'API-HMAC': hmac,
  };

  const response = await fetch(`${API_BASE}${path}`, { headers });
  
  console.log('Response status:', response.status);
  
  const responseText = await response.text();
  console.log('Raw response (first 500 chars):', responseText.substring(0, 500));
  
  if (!response.ok) {
    console.error('API Error:', response.status, responseText);
    throw new Error(`API Error: ${response.status} - ${responseText}`);
  }
  
  let data: BoltzStatsData;
  try {
    data = JSON.parse(responseText);
    console.log('Parsed response - years:', Object.keys(data));
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    throw new Error('Invalid response from API');
  }
  
  return processStatsData(data);
}

// Validate API credentials by making an authenticated request
export async function validateCredentials(apiKey: string, apiSecret: string): Promise<boolean> {
  try {
    const path = '/v2/referral/stats';
    const ts = Math.round(new Date().getTime() / 1000);
    const method = 'GET';
    
    const message = `${ts}${method}${path}`;
    const hmac = await createHmac(message, apiSecret);
    
    const headers: Record<string, string> = {
      'TS': ts.toString(),
      'API-KEY': apiKey,
      'API-HMAC': hmac,
    };

    const response = await fetch(`${API_BASE}${path}`, { headers });
    console.log('Validation response status:', response.status);
    
    return response.ok;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

function processStatsData(statsData: BoltzStatsData): ReferralStats {
  console.log('Processing stats data...');
  
  const monthlyData: MonthlyStats[] = [];
  
  // Process the nested year/month structure
  Object.entries(statsData).forEach(([year, yearData]) => {
    Object.entries(yearData).forEach(([month, monthData]) => {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      
      // Extract volume and trades
      const volumeBtc = parseFloat(monthData.volume?.total || '0');
      const tradeCount = monthData.trades?.total || 0;
      
      if (tradeCount > 0 || volumeBtc > 0) {
        const avgTradeSize = tradeCount > 0 
          ? Math.round((volumeBtc * 100_000_000) / tradeCount) 
          : 0;
        
        monthlyData.push({
          month: getMonthName(monthNum),
          year: yearNum,
          volumeBtc,
          tradeCount,
          avgTradeSize,
          feesEarnedSats: calculateFees(volumeBtc * 100_000_000),
        });
      }
    });
  });
  
  // Sort by date
  monthlyData.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return getMonthIndex(a.month) - getMonthIndex(b.month);
  });
  
  console.log('Processed monthly data:', monthlyData);
  
  // Calculate month-over-month changes
  for (let i = 1; i < monthlyData.length; i++) {
    const prev = monthlyData[i - 1];
    monthlyData[i].volumeChange = prev.volumeBtc > 0 
      ? ((monthlyData[i].volumeBtc - prev.volumeBtc) / prev.volumeBtc) * 100 
      : 0;
    monthlyData[i].tradeChange = prev.tradeCount > 0 
      ? ((monthlyData[i].tradeCount - prev.tradeCount) / prev.tradeCount) * 100 
      : 0;
  }
  
  // Calculate all-time stats
  const allTime = {
    volumeBtc: monthlyData.reduce((sum, m) => sum + m.volumeBtc, 0),
    tradeCount: monthlyData.reduce((sum, m) => sum + m.tradeCount, 0),
    avgTradeSize: 0,
    feesEarnedSats: monthlyData.reduce((sum, m) => sum + m.feesEarnedSats, 0),
  };
  
  allTime.avgTradeSize = allTime.tradeCount > 0 
    ? Math.round((allTime.volumeBtc * 100_000_000) / allTime.tradeCount) 
    : 0;
  
  console.log('All-time stats:', allTime);
  
  return { allTime, monthly: monthlyData };
}

function getMonthName(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || 'Unknown';
}

function getMonthIndex(monthName: string): number {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.indexOf(monthName);
}

function calculateFees(volumeSats: number): number {
  // Assuming 0.1% fee share for partners
  return Math.round(volumeSats * 0.001);
}
