# Boltz Partner Dashboard

A self-service dashboard for Boltz partners to view their referral performance metrics.

## Features

- 🔐 **Secure Login** - Partners authenticate with their referral API keys
- 📊 **Real-time Stats** - View volume, trade counts, and more
- 📈 **Performance Charts** - Visualize monthly trends
- 📋 **Monthly Breakdown** - Detailed table with month-over-month changes

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

## How It Works

Partners log in using their Boltz referral ID API keys. The dashboard fetches their stats directly from the Boltz API (`https://api.boltz.exchange/v2/referral/{id}/stats`) and displays:

- **Total Volume** - All-time trading volume in BTC
- **Total Trades** - Number of completed swaps
- **Average Trade Size** - Mean transaction size in sats

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide Icons

## Security Notes

- No backend required - connects directly to Boltz API
- Session stored in localStorage

---

[Boltz Partner Program](https://api.docs.boltz.exchange/partner-program)

