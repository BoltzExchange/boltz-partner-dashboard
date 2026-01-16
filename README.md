# Boltz Partner Dashboard

A self-service dashboard for Boltz partners to view their referral performance metrics.

## Features

- 🔐 **Secure Login** - Partners authenticate with their referral ID
- 📊 **Real-time Stats** - View volume, trade counts, and estimated earnings
- 📈 **Performance Charts** - Visualize monthly trends
- 📋 **Monthly Breakdown** - Detailed table with month-over-month changes
- 🌙 **Dark Mode** - Eye-friendly dark interface

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

Partners log in using their Boltz referral ID. The dashboard fetches their stats directly from the Boltz API (`https://api.boltz.exchange/v2/referral/{id}/stats`) and displays:

- **Total Volume** - All-time trading volume in BTC
- **Total Trades** - Number of completed swaps
- **Average Trade Size** - Mean transaction size in sats
- **Estimated Fees** - Projected partner revenue share

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide Icons

## Security Notes

- No backend required - connects directly to Boltz API
- Session stored in localStorage (referral ID only)
- Partners can only view their own data

---

Boltz Partner Program

