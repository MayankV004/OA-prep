'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GroupStat { group: string; total: number; completed: number }

export function GroupProgress({ data }: { data: GroupStat[] }) {
  const chartData = data.map(d => ({
    name: d.group,
    completed: d.completed,
    remaining: d.total - d.completed,
  }));

  if (!chartData.length) return (
    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
      No data yet
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 36)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          dataKey="name"
          type="category"
          width={130}
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
        <Bar dataKey="remaining" stackId="a" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
