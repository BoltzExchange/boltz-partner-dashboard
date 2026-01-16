import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { MonthlyStats } from '../types';
import { useDenomination, Denomination } from '../contexts/DenominationContext';

interface PerformanceChartProps {
  data: MonthlyStats[];
  dataKey: 'volumeBtc' | 'tradeCount' | 'avgTradeSize';
  title: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  dataKey: string;
  formatValue: (btc: number) => string;
  formatSats: (sats: number) => string;
}

function CustomTooltip({ active, payload, label, dataKey, formatValue, formatSats }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as MonthlyStats;
  
  const getFormattedValue = () => {
    switch (dataKey) {
      case 'volumeBtc':
        return formatValue(data.volumeBtc);
      case 'tradeCount':
        return `${data.tradeCount.toLocaleString()} swaps`;
      case 'avgTradeSize':
        return formatSats(data.avgTradeSize);
      default:
        return String(payload[0].value);
    }
  };

  const getChangeValue = () => {
    if (dataKey === 'avgTradeSize') return null; // No MoM change for avg trade size
    return dataKey === 'volumeBtc' ? data.volumeChange : data.tradeChange;
  };

  const change = getChangeValue();
  
  return (
    <div className="bg-night-900 border border-night-700 rounded-xl p-4 shadow-xl">
      <p className="text-night-300 text-sm mb-2">{label} {data.year}</p>
      <div className="space-y-1">
        <p className="text-night-100 font-semibold mono-nums">
          {getFormattedValue()}
        </p>
        {change !== undefined && change !== null && (
          <p className={`text-sm ${change >= 0 ? 'text-volt-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}% from prev
          </p>
        )}
      </div>
    </div>
  );
}

export default function PerformanceChart({ data, dataKey, title }: PerformanceChartProps) {
  const { denomination, formatValue, formatSats } = useDenomination();
  
  const chartData = data.map(item => ({
    ...item,
    label: `${item.month} ${item.year}`,
    volumeDisplay: denomination === Denomination.SAT ? item.volumeBtc * 100_000_000 : item.volumeBtc,
  }));

  const formatYAxis = (value: number) => {
    switch (dataKey) {
      case 'volumeBtc':
        if (denomination === Denomination.SAT) {
          if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
          if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
          if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
          return value.toLocaleString();
        }
        return `${value.toFixed(2)}`;
      case 'tradeCount':
        return value.toLocaleString();
      case 'avgTradeSize':
        if (denomination === Denomination.BTC) {
          const btc = value / 100_000_000;
          return btc.toFixed(4);
        }
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value.toLocaleString();
      default:
        return String(value);
    }
  };

  // Use different colors for efficiency chart
  const isEfficiencyChart = dataKey === 'avgTradeSize';
  const strokeColor = isEfficiencyChart ? '#f59e0b' : '#00d94e';
  const gradientId = isEfficiencyChart ? 'colorGradientAmber' : 'colorGradient';

  const actualDataKey = dataKey === 'volumeBtc' && denomination === Denomination.SAT 
    ? 'volumeDisplay' 
    : dataKey;

  return (
    <div className="bg-night-900/60 backdrop-blur-sm border border-night-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-night-100 mb-6">{title}</h3>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d94e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d94e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGradientAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#41414b" 
              vertical={false}
            />
            <XAxis 
              dataKey="label" 
              tick={{ fill: '#91919f', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#41414b' }}
            />
            <YAxis 
              tick={{ fill: '#91919f', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip 
              content={
                <CustomTooltip 
                  dataKey={dataKey} 
                  formatValue={formatValue} 
                  formatSats={formatSats} 
                />
              } 
            />
            <Area
              type="monotone"
              dataKey={actualDataKey}
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={{ fill: strokeColor, strokeWidth: 0, r: 4 }}
              activeDot={{ fill: strokeColor, strokeWidth: 2, stroke: '#0d0d10', r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
