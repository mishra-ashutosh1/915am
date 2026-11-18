import { Plus, RefreshCw, Trash2, Download, RotateCcw } from 'lucide-react';

interface ActionBarProps {
  onAddHolding: () => void;
  onAutoSplit: () => void;
  onClearAdditions: () => void;
  onLoadExample: () => void;
  onClearAll: () => void;
  onExportCSV: () => void;
  hasHoldings: boolean;
}

export function ActionBar({
  onAddHolding,
  onAutoSplit,
  onClearAdditions,
  onLoadExample,
  onClearAll,
  onExportCSV,
  hasHoldings,
}: ActionBarProps) {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
      <button
        onClick={onAddHolding}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Holding
      </button>
      <button
        onClick={onAutoSplit}
        disabled={!hasHoldings}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className="w-4 h-4" /> Split Fresh Money
      </button>
      <button
        onClick={onClearAdditions}
        disabled={!hasHoldings}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RotateCcw className="w-4 h-4" /> Clear Additions
      </button>
      <button
        onClick={onLoadExample}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
      >
        Load Example
      </button>
      <button
        onClick={onClearAll}
        disabled={!hasHoldings}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" /> Clear All
      </button>
      <button
        onClick={onExportCSV}
        disabled={!hasHoldings}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
      >
        <Download className="w-4 h-4" /> Export CSV
      </button>
    </div>
  );
}