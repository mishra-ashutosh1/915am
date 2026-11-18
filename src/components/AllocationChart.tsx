import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { HoldingWithMetrics } from './types';

const COLORS = [
  'hsl(215 52% 46%)', 'hsl(268 52% 46%)', 'hsl(321 52% 46%)',
  'hsl(14 52% 46%)', 'hsl(67 52% 46%)', 'hsl(120 52% 46%)',
  'hsl(173 52% 46%)', 'hsl(226 52% 46%)', 'hsl(279 52% 46%)',
  'hsl(332 52% 46%)', 'hsl(25 52% 46%)', 'hsl(78 52% 46%)',
];

const getColor = (index: number) => COLORS[index % COLORS.length];

interface AllocationChartProps {
  holdings: HoldingWithMetrics[];
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  nowPct: number;
  afterPct: number;
  current?: number;
  target?: number;
}

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Current: {item.nowPct.toFixed(1)}% → After: {item.afterPct.toFixed(1)}%
      </p>
    </div>
  );
};

const BarTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Current: {item.nowPct.toFixed(1)}% → Target: {item.afterPct.toFixed(1)}%
      </p>
    </div>
  );
};

export function AllocationChart({ holdings }: AllocationChartProps) {
  const filtered = holdings.filter((h) => h.afterPct > 0);
  const total = filtered.reduce((s, h) => s + h.afterPct, 0) || 1;

  const chartData: ChartDataItem[] = filtered.map((h, i) => ({
    name: h.name || 'Unnamed',
    value: Number(((h.afterPct / total) * 100).toFixed(1)),
    color: h.color || getColor(i),
    nowPct: h.nowPct,
    afterPct: h.afterPct,
    current: Number(h.nowPct.toFixed(1)),
    target: Number(h.afterPct.toFixed(1)),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Allocation After Planned Additions
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => {
                  const p = percent ?? 0;
                  return p > 0.05 ? (
                    <span className="text-xs font-medium fill-white">{name} {(p * 100).toFixed(1)}%</span>
                  ) : null;
                }}
                labelLine={false}
              >
                {chartData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={getColor(i)} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => value}
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current vs Target Allocation
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'dataMax + 10']}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11, fill: '#374151' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="current" name="Current %" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={30} />
              <Bar dataKey="target" name="Target %" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}