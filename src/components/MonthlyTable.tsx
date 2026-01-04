import { MonthlyStats } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MonthlyTableProps {
  data: MonthlyStats[];
}

function ChangeIndicator({ value }: { value?: number }) {
  if (value === undefined) return <Minus className="w-4 h-4 text-night-500" />;
  
  const isPositive = value > 0;
  const isNegative = value < 0;
  
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium
      ${isPositive ? 'text-volt-400' : ''}
      ${isNegative ? 'text-red-400' : ''}
      ${!isPositive && !isNegative ? 'text-night-500' : ''}
    `}>
      {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
      {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
      {isPositive && '+'}
      {value.toFixed(1)}%
    </span>
  );
}

export default function MonthlyTable({ data }: MonthlyTableProps) {
  // Show data in reverse chronological order
  const sortedData = [...data].reverse();

  return (
    <div className="bg-night-900/60 backdrop-blur-sm border border-night-800 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-night-800">
        <h3 className="text-lg font-semibold text-night-100">Monthly Breakdown</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-night-900">
              <th className="text-left text-night-400 text-sm font-medium px-6 py-4">Month</th>
              <th className="text-right text-night-400 text-sm font-medium px-6 py-4">Volume</th>
              <th className="text-right text-night-400 text-sm font-medium px-6 py-4">Δ</th>
              <th className="text-right text-night-400 text-sm font-medium px-6 py-4">Trades</th>
              <th className="text-right text-night-400 text-sm font-medium px-6 py-4">Δ</th>
              <th className="text-right text-night-400 text-sm font-medium px-6 py-4">Avg Size</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((month, index) => (
              <tr 
                key={`${month.month}-${month.year}`}
                className="border-t border-night-800/50 hover:bg-night-800/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-night-200 font-medium">
                    {month.month} {month.year}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-night-100 font-semibold mono-nums">
                    {month.volumeBtc.toFixed(4)} BTC
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <ChangeIndicator value={month.volumeChange} />
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-night-100 font-semibold mono-nums">
                    {month.tradeCount.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <ChangeIndicator value={month.tradeChange} />
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-night-300 mono-nums">
                    {month.avgTradeSize.toLocaleString()} sats
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

