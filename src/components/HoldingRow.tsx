import { HOLDING_TYPES } from './types';
import { pc } from '../utils';
import { cn } from '../lib/utils';
import { AlertTriangle, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import type { HoldingWithMetrics } from './types';
import type { Holding } from '../types';

interface HoldingRowProps {
  holding: HoldingWithMetrics;
  onUpdate: (id: string, field: keyof Holding, value: string | number) => void;
  onRemove: (id: string) => void;
}

export function HoldingRow({ holding, onUpdate, onRemove }: HoldingRowProps) {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <td className="py-3 px-2">
        <input
          type="text"
          value={holding.name}
          onChange={(e) => onUpdate(holding.id, 'name', e.target.value)}
          placeholder="Name"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="py-3 px-2">
        <select
          value={holding.type}
          onChange={(e) => onUpdate(holding.id, 'type', e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {HOLDING_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          step="0.01"
          min="0"
          value={holding.value}
          onChange={(e) => onUpdate(holding.id, 'value', e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          step="0.01"
          min="0"
          value={holding.add}
          onChange={(e) => onUpdate(holding.id, 'add', e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={holding.target}
          onChange={(e) => onUpdate(holding.id, 'target', e.target.value)}
          placeholder="optional"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="py-3 px-2 text-right text-sm font-mono text-gray-600 dark:text-gray-400">
        {pc(holding.nowPct)}
      </td>
      <td className="py-3 px-2 text-right text-sm font-mono font-semibold">
        <span className={cn(holding.overLimit && 'text-red-500')}>{pc(holding.afterPct)}</span>
        {holding.overLimit && (
          <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> over limit
          </span>
        )}
      </td>
      <td className="py-3 px-2">
        <span
          className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            holding.needClass === 'warn' && 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
            holding.needClass === 'bad' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            holding.needClass === 'ok' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            holding.needClass === 'mute' && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          )}
        >
          {holding.needClass === 'warn' && <Plus className="w-3 h-3 mr-1" />}
          {holding.needClass === 'bad' && <XCircle className="w-3 h-3 mr-1" />}
          {holding.needClass === 'ok' && <CheckCircle className="w-3 h-3 mr-1" />}
          {holding.need}
        </span>
      </td>
      <td className="py-3 px-2 text-center">
        <button
          onClick={() => onRemove(holding.id)}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          aria-label="Remove holding"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}