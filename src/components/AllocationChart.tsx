import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { HoldingWithMetrics } from './types';

interface AllocationChartProps { holdings: HoldingWithMetrics[]; }
interface ChartItem { id: string; name: string; color: string; current: number; after: number; target: number; }
const COLORS = ['#3b82f6', '#a78bfa', '#ec4899', '#f97316', '#a3b82e', '#22c55e'];

function ChartTooltip({ active, payload, comparison = false }: { active?: boolean; payload?: Array<{ payload: ChartItem }>; comparison?: boolean }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 shadow-lg text-sm text-gray-900 dark:text-gray-100">
      <p className="font-medium">{item.name}</p>
      <p>Current: {item.current.toFixed(1)}%</p>
      <p>{comparison ? 'Target' : 'After additions'}: {(comparison ? item.target : item.after).toFixed(1)}%</p>
    </div>
  );
}

export function AllocationChart({ holdings }: AllocationChartProps) {
  const { barData, pieData } = useMemo(() => {
    const data: ChartItem[] = holdings.map((holding, index) => ({
      id: holding.id,
      name: holding.name || 'Unnamed',
      color: holding.color || COLORS[index % COLORS.length],
      current: Number.isFinite(holding.nowPct) ? holding.nowPct : 0,
      after: Number.isFinite(holding.afterPct) ? holding.afterPct : 0,
      target: Number.isFinite(holding.target) ? holding.target : 0,
    }));
    return { barData: data, pieData: data.filter((holding) => holding.after > 0) };
  }, [holdings]);
  const panel = 'min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6';
  const heading = 'mb-4 text-lg font-semibold text-gray-900 dark:text-white';
  const scrollChart = barData.length > 6;
  const chartHeight = Math.max(288, barData.length * 52 + 48);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className={panel} aria-label="Allocation after planned additions">
        <h3 className={heading}>Allocation After Planned Additions</h3>
        {pieData.length ? (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="after" nameKey="name" cx="50%" cy="50%" innerRadius="55%" outerRadius="85%" paddingAngle={2} isAnimationActive={false}>
                    {pieData.map((item) => <Cell key={item.id} fill={item.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-200">
              {pieData.map((item) => (
                <li key={item.id} className="flex min-w-0 items-center gap-2">
                  <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="break-words">{item.name}: {item.after.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </>
        ) : <p className="py-20 text-center text-gray-600 dark:text-gray-300">Add a holding value or planned addition to see allocations.</p>}
      </section>
      <section className={panel} aria-label="Current versus target allocation">
        <h3 className={heading}>Current vs Target Allocation</h3>
        {barData.length ? (
          <>
            <div className={`${scrollChart ? 'max-h-96 overflow-y-auto ' : ''}text-gray-700 dark:text-gray-200`} style={scrollChart ? { colorScheme: 'light dark' } : undefined} tabIndex={scrollChart ? 0 : undefined} role={scrollChart ? 'region' : undefined} aria-label={scrollChart ? 'Scrollable allocation comparison' : undefined}>
              <div style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 8, right: 24, bottom: 16, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} horizontal={false} />
                    <XAxis type="number" height={36} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 12, fill: 'currentColor' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: 'currentColor' }} axisLine={false} tickLine={false} interval={0} />
                    <Tooltip content={<ChartTooltip comparison />} />
                    <Bar dataKey="current" name="Current %" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
                    <Bar dataKey="target" name="Target %" fill="#a78bfa" radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-gray-700 dark:text-gray-200">
              <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded-sm bg-blue-500" />Current %</span>
              <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded-sm bg-violet-400" />Target %</span>
            </div>
          </>
        ) : <p className="py-20 text-center text-gray-600 dark:text-gray-300">Add holdings and target percentages to compare allocations.</p>}
      </section>
    </div>
  );
}
