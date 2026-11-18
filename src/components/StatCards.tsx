import { fmt } from '../utils';
import { cn } from '../lib/utils';
import type { CalculatedMetrics } from './types';

interface StatCardProps {
  label: string;
  value: string;
  color?: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold', color)}>{value}</p>
    </div>
  );
}

export function StatCards({ metrics }: { metrics: CalculatedMetrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Current Total" value={fmt(metrics.totalCurrent)} />
      <StatCard label="Planned Additions" value={fmt(metrics.totalAdditions)} />
      <StatCard label="Total After" value={fmt(metrics.totalAfter)} />
      <StatCard
        label="Fresh Money Left"
        value={fmt(Math.abs(metrics.freshRemaining))}
        color={metrics.freshRemaining < -0.5 ? 'text-red-500' : ''}
      />
    </div>
  );
}