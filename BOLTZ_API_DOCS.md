# Boltz API Documentation

## Partner Referral Stats Endpoint

### Endpoint
```
GET https://api.boltz.exchange/v2/referral/stats
```

### Authentication

The Boltz API uses **HMAC-SHA256** signature authentication. Each request must include three headers:

#### Required Headers
- `TS` - Unix timestamp (seconds since epoch)
- `API-KEY` - Your Boltz partner API key
- `API-HMAC` - HMAC signature of the request

#### HMAC Signature Generation

```javascript
// 1. Create the message to sign
const timestamp = Math.round(Date.now() / 1000)
const method = 'GET'
const path = '/v2/referral/stats'
const message = `${timestamp}${method}${path}`

// 2. Generate HMAC-SHA256 signature using your API secret
const hmac = crypto
  .createHmac('sha256', API_SECRET)
  .update(message)
  .digest('hex')

// 3. Include in request headers
const headers = {
  'TS': timestamp.toString(),
  'API-KEY': API_KEY,
  'API-HMAC': hmac
}
```

#### Example in Browser (Web Crypto API)

```typescript
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
```

### Request Example

```bash
curl -X GET "https://api.boltz.exchange/v2/referral/stats" \
  -H "TS: 1704912000" \
  -H "API-KEY: your-api-key-here" \
  -H "API-HMAC: generated-hmac-signature"
```

### Response Structure

The API returns referral statistics organized by year and month:

```json
{
  "2024": {
    "1": {
      "volume": {
        "total": "1.23456789",
        "BTC/BTC": "0.5",
        "L-BTC/BTC": "0.73456789"
      },
      "trades": {
        "total": 150,
        "BTC/BTC": 75,
        "L-BTC/BTC": 75
      },
      "groups": {
        "partner-id-1": {
          "volume": { "total": "0.5" },
          "trades": { "total": 50 }
        },
        "partner-id-2": {
          "volume": { "total": "0.73456789" },
          "trades": { "total": 100 }
        }
      }
    },
    "2": {
      "volume": {
        "total": "2.5",
        "BTC/BTC": "1.2",
        "L-BTC/BTC": "1.3"
      },
      "trades": {
        "total": 200,
        "BTC/BTC": 100,
        "L-BTC/BTC": 100
      },
      "groups": {
        "partner-id-1": {
          "volume": { "total": "1.0" },
          "trades": { "total": 80 }
        },
        "partner-id-2": {
          "volume": { "total": "1.5" },
          "trades": { "total": 120 }
        }
      }
    }
  },
  "2025": {
    "1": {
      "volume": {
        "total": "3.14159265",
        "BTC/BTC": "1.5",
        "L-BTC/BTC": "1.64159265"
      },
      "trades": {
        "total": 250,
        "BTC/BTC": 120,
        "L-BTC/BTC": 130
      },
      "groups": {
        "partner-id-1": {
          "volume": { "total": "1.2" },
          "trades": { "total": 100 }
        },
        "partner-id-2": {
          "volume": { "total": "1.94159265" },
          "trades": { "total": 150 }
        }
      }
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `{year}` | Object | Container for all months in that year |
| `{year}.{month}` | Object | Stats for specific month (1-12) |
| `{year}.{month}.volume` | Object | Volume breakdown by trading pair |
| `{year}.{month}.volume.total` | String | Total volume in BTC for the month |
| `{year}.{month}.trades` | Object | Trade count breakdown by trading pair |
| `{year}.{month}.trades.total` | Number | Total number of swaps for the month |
| `{year}.{month}.groups` | Object | Sub-partner breakdown (if applicable) |
| `{year}.{month}.groups.{partnerId}` | Object | Stats for specific sub-partner |

### Notes

1. **Volume Format**: All volume values are in BTC as strings (to preserve precision)
2. **Trading Pairs**: The response includes breakdowns by trading pair (e.g., "BTC/BTC", "L-BTC/BTC")
3. **Groups**: Only present if you have sub-partners under your referral program
4. **Month Numbers**: Months are numbered 1-12 (1 = January, 12 = December)

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Invalid API key or signature"
}
```

#### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

#### 429 Rate Limited
```json
{
  "error": "Too many requests"
}
```

### Rate Limits

- **Limit**: 60 requests per minute
- **Recommended**: Cache responses for at least 1 minute

### Example Processing

```typescript
interface MonthlyStats {
  month: string;
  year: number;
  volumeBtc: number;
  tradeCount: number;
  avgTradeSize: number;
}

function processStatsData(data: any): MonthlyStats[] {
  const monthly: MonthlyStats[] = [];
  
  Object.entries(data).forEach(([year, yearData]: [string, any]) => {
    Object.entries(yearData).forEach(([month, monthData]: [string, any]) => {
      const volumeBtc = parseFloat(monthData.volume?.total || '0');
      const tradeCount = monthData.trades?.total || 0;
      
      monthly.push({
        month: getMonthName(parseInt(month)),
        year: parseInt(year),
        volumeBtc,
        tradeCount,
        avgTradeSize: tradeCount > 0 
          ? Math.round((volumeBtc * 100_000_000) / tradeCount) 
          : 0,
      });
    });
  });
  
  return monthly.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return getMonthIndex(a.month) - getMonthIndex(b.month);
  });
}
```

## Additional Endpoints

### Get Partner Fees
```
GET https://api.boltz.exchange/v2/referral/fees
```
Returns fee earnings breakdown by currency and time period.

### Get Referral Info
```
GET https://api.boltz.exchange/v2/referral
```
Returns general information about your referral program.

---

**API Base URL**: `https://api.boltz.exchange`

**API Version**: v2

**Documentation**: https://docs.boltz.exchange
