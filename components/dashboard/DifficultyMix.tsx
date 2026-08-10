'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DifficultyMixProps {
  data: { Easy?: number; Medium?: number; Hard?: number };
  groups?: string[];
}

export function DifficultyMix({ data }: DifficultyMixProps) {
  const chartData = [
    { name: 'Difficulty', Easy: data.Easy ?? 0, Medium: data.Medium ?? 0, Hard: data.Hard ?? 0 },
  ];

  const total = (data.Easy ?? 0) + (data.Medium ?? 0) + (data.Hard ?? 0);
  if (!total) return (
    <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
      No completed problems yet
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-sm">
        {(['Easy', 'Medium', 'Hard'] as const).map(d => (
          <div key={d} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${
              d === 'Easy' ? 'bg-emerald-500' : d === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <span className="text-muted-foreground">{d}</span>
            <span className="font-medium">{data[d] ?? 0}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={40}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" hide />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="Easy" stackId="d" fill="#10b981" radius={[4, 0, 0, 4]} />
          <Bar dataKey="Medium" stackId="d" fill="#f59e0b" />
          <Bar dataKey="Hard" stackId="d" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
