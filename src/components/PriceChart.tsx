import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { StockData } from '../types';
import { formatCurrency } from '../lib/utils';

export default function PriceChart({ data, currency = 'USD' }: { data: StockData['historical'] | null | undefined, currency?: string }) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(d => ({
      ...d,
      dateFormatted: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: d.date.includes('T00:00') ? undefined : '2-digit', minute: d.date.includes('T00:00') ? undefined : '2-digit' }),
    }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return <div className="w-full h-full flex items-center justify-center font-mono text-ink-45">[ NO DATA ]</div>;
  }

  const isPositive = chartData[chartData.length - 1].close >= chartData[0].close;
  const strokeColor = isPositive ? '#34d399' : '#f87171';
  const fillColor = isPositive ? 'url(#colorPositive)' : 'url(#colorNegative)';

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col font-mono">
      <div className="flex items-center gap-4 mb-2 pl-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: strokeColor }}></div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-ink-70">Closing Price</span>
        </div>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="dateFormatted" 
              stroke="var(--color-ink-45)" 
              fontSize={10}
              fontFamily="var(--font-mono)"
              tickLine={false} 
              axisLine={false}
              minTickGap={30}
              dy={10}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="var(--color-ink-45)" 
              fontSize={10} 
              fontFamily="var(--font-mono)"
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => {
                let prefix = '$';
                if (currency === 'INR') prefix = '₹';
                else if (currency === 'EUR') prefix = '€';
                else if (currency === 'GBP') prefix = '£';
                else if (currency === 'JPY') prefix = '¥';
                return `${prefix}${value.toFixed(0)}`;
              }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-paper border border-ink p-3 shadow-md">
                      <p className="font-sans font-bold text-[10px] uppercase tracking-widest text-ink-70 mb-1 border-b border-rule/50 pb-1">{data.dateFormatted}</p>
                      <p className="font-mono font-bold text-xl text-ink leading-none mt-2">{formatCurrency(data.close, currency)}</p>
                      <div className="flex gap-4 mt-3 text-[11px] font-mono">
                        <div>
                          <span className="text-ink-45">H </span>
                          <span className="text-ink">{formatCurrency(data.high, currency)}</span>
                        </div>
                        <div>
                          <span className="text-ink-45">L </span>
                          <span className="text-ink">{formatCurrency(data.low, currency)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="linear" 
              dataKey="close" 
              stroke={strokeColor} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={fillColor} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
