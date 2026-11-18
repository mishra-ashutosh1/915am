import { HoldingRow } from './HoldingRow';
import type { HoldingWithMetrics } from './types';
import type { Holding } from '../types';

interface HoldingsTableProps {
  holdings: HoldingWithMetrics[];
  onUpdate: (id: string, field: keyof Holding, value: string | number) => void;
  onRemove: (id: string) => void;
}

export function HoldingsTable({ holdings, onUpdate, onRemove }: HoldingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[22%]">Holding</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[11%]">Type</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Value (₹)</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Add (₹)</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target %</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">Now</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">After</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">To Reach Target</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[5%]"></th>
          </tr>
        </thead>
        <tbody>
          {holdings.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                No holdings yet. Choose <strong>Add Holding</strong> or <strong>Load Example</strong>.
              </td>
            </tr>
          ) : (
            holdings.map((h) => (
              <HoldingRow key={h.id} holding={h} onUpdate={onUpdate} onRemove={onRemove} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}