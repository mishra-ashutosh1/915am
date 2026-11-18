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

export function ActionBar({ onAddHolding, onAutoSplit, onClearAdditions, onLoadExample, onClearAll, onExportCSV, hasHoldings }: ActionBarProps) {
  const secondary = 'inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed';
  const primary = 'inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors';

  const handleLoadExample = () => {
    if (hasHoldings && !window.confirm('Replace your existing holdings with the sample portfolio? Export your current plan first if you want to keep it.')) return;
    onLoadExample();
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      {!hasHoldings && (
        <div className="mb-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Explore a sample portfolio</h3>
          <p id="example-description" className="mt-1 mb-3 text-sm text-gray-700 dark:text-gray-300">Try five fictional holdings totaling ₹8,00,000 to explore allocations and planned additions. Sample data — for demonstration only, not investment advice.</p>
          <button type="button" onClick={handleLoadExample} aria-describedby="example-description" className={primary}>Try an example portfolio</button>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onAddHolding} className={primary}><Plus className="w-4 h-4" /> Add Holding</button>
        <button type="button" onClick={onAutoSplit} disabled={!hasHoldings} className={secondary}><RefreshCw className="w-4 h-4" /> Split Fresh Money</button>
        <button type="button" onClick={onClearAdditions} disabled={!hasHoldings} className={secondary}><RotateCcw className="w-4 h-4" /> Clear Additions</button>
        {hasHoldings && <button type="button" onClick={handleLoadExample} className={secondary}>Load Example (demo)</button>}
        <button type="button" onClick={onClearAll} disabled={!hasHoldings} className={secondary}><Trash2 className="w-4 h-4" /> Clear All</button>
        <button type="button" onClick={onExportCSV} disabled={!hasHoldings} className={`${secondary} ml-auto`}><Download className="w-4 h-4" /> Export CSV</button>
      </div>
    </div>
  );
}
