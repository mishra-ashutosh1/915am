import { HoldingRow } from './HoldingRow';
import type { HoldingWithMetrics } from './types';
import type { Holding } from '../types';
import { HOLDING_TYPES } from './types';
import { pc } from '../utils';
import { cn } from '../lib/utils';
import { AlertTriangle, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { FormattedNumberInput } from './FormattedNumberInput';

interface HoldingsTableProps {
  holdings: HoldingWithMetrics[];
  onUpdate: (id: string, field: keyof Holding, value: string | number) => void;
  onRemove: (id: string) => void;
}

export function HoldingsTable({ holdings, onUpdate, onRemove }: HoldingsTableProps) {
  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
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
                <td colSpan={9} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                  No holdings yet. Choose <strong>Add Holding</strong>, <strong>Try an example portfolio</strong>, or <strong>Import CSV</strong>.
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

      {/* Mobile Stacked Card View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {holdings.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No holdings yet. Tap <strong>Add Holding</strong>, <strong>Try an example portfolio</strong>, or <strong>Import CSV</strong>.
          </div>
        ) : (
          holdings.map((h) => (
            <div key={h.id} className="p-4 space-y-3 bg-white dark:bg-gray-800">
              {/* Card Header: Name, Type, Delete */}
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: h.color }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={h.name}
                    onChange={(e) => onUpdate(h.id, 'name', e.target.value)}
                    placeholder="Holding Name"
                    aria-label={`Holding name for ${h.name || 'new holding'}`}
                    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={h.type}
                  onChange={(e) => onUpdate(h.id, 'type', e.target.value)}
                  aria-label={`Holding type for ${h.name || 'holding'}`}
                  className="px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {HOLDING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onRemove(h.id)}
                  aria-label={`Remove holding ${h.name || ''}`}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Inputs: Value and Add */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 mb-0.5">Current Value (₹)</label>
                  <FormattedNumberInput
                    value={h.value}
                    onChange={(val) => onUpdate(h.id, 'value', val)}
                    placeholder="0"
                    ariaLabel={`Current value for ${h.name || 'holding'}`}
                    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-right font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 mb-0.5">Add (₹)</label>
                  <FormattedNumberInput
                    value={h.add}
                    onChange={(val) => onUpdate(h.id, 'add', val)}
                    placeholder="0"
                    ariaLabel={`Addition amount for ${h.name || 'holding'}`}
                    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-right font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Card Target & Percentage Metrics */}
              <div className="grid grid-cols-3 gap-2 items-center pt-1 border-t border-gray-100 dark:border-gray-700/60">
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">Target %</label>
                  <FormattedNumberInput
                    value={h.target}
                    onChange={(val) => onUpdate(h.id, 'target', val)}
                    placeholder="0"
                    min={0}
                    max={100}
                    step={0.5}
                    formatWithCommas={false}
                    ariaLabel={`Target percentage for ${h.name || 'holding'}`}
                    className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-right font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-center">
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400">Now</span>
                  <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                    {pc(h.nowPct)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400">After</span>
                  <span className={cn('text-xs font-mono font-semibold', h.overLimit ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white')}>
                    {pc(h.afterPct)}
                  </span>
                </div>
              </div>

              {/* Status footer with overLimit and need status */}
              <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-xs">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    h.needClass === 'warn' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
                    h.needClass === 'bad' && 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200',
                    h.needClass === 'ok' && 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200',
                    h.needClass === 'mute' && 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {h.needClass === 'warn' && <Plus className="w-3 h-3 mr-1" />}
                  {h.needClass === 'bad' && <XCircle className="w-3 h-3 mr-1" />}
                  {h.needClass === 'ok' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {h.need}
                </span>

                {h.overLimit && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200">
                    <AlertTriangle className="w-3 h-3 mr-1" /> &gt; {pc(h.afterPct)} cap
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
