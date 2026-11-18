import { AlertTriangle } from 'lucide-react';
import type { CalculatedMetrics } from './types';

interface FooterNoteProps {
  metrics: CalculatedMetrics;
}

export function FooterNote({ metrics }: FooterNoteProps) {
  return (
    <>
      {metrics.targetsSum > 0 && Math.abs(metrics.targetsSum - 100) > 0.05 && (
        <div className="mx-4 mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Targets add up to {metrics.targetsSum.toFixed(1)}%. They don't need to reach 100%, but it helps when splitting fresh money.
        </div>
      )}
      <p className="mx-4 mb-4 text-sm text-gray-500 dark:text-gray-400 max-w-3xl">
        "To reach target" shows the new money that alone lifts a holding to its target share, or how much it is above target.
        The single-stock limit applies to rows marked Stock. Your entries stay in this browser only.
      </p>
    </>
  );
}