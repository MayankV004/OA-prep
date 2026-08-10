'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface TrendPoint { date: string; completed: number }

export function CompletionTrend({ data }: { data: TrendPoint[] }) {
  if (!data.length) return (
    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
      No completions in the last 90 days
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tickFormatter={d => {
            try { return format(parseISO(d), 'MMM d'); } catch { return d; }
          }}
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={24}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelFormatter={d => {
            try { return format(parseISO(d as string), 'MMM d, yyyy'); } catch { return d; }
          }}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
