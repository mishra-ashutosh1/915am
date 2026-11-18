import { Toaster, toast } from 'sonner';
import { usePortfolioActions } from './hooks/usePortfolioActions';
import { calculateMetrics } from './utils';
import {
  StatCards,
  FreshMoneyInput,
  AllocationChart,
  HoldingsTable,
  ActionBar,
  FooterNote,
} from './components';

export default function App() {
  const {
    holdings,
    freshMoney,
    singleStockCap,
    addHolding,
    removeHolding,
    updateHolding,
    setFreshMoney,
    setSingleStockCap,
    clearAdditions,
    loadExample,
    clearAll,
    autoSplitFreshMoney,
    exportCSV,
  } = usePortfolioActions();

  const metrics = calculateMetrics(holdings, freshMoney, singleStockCap);

  const handleAutoSplit = () => {
    const result = autoSplitFreshMoney();
    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Toaster
        position="bottom-right"
        theme="system"
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
        toastOptions={{
          style: { borderRadius: '0.75rem' },
        }}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Allocation Planner</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400 max-w-2xl">
            Enter what you hold today. See each holding's share of the total, then plan new money and check where it lands.
          </p>
        </header>

        <StatCards metrics={metrics} />

        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <FreshMoneyInput
            freshMoney={freshMoney}
            singleStockCap={singleStockCap}
            onFreshMoneyChange={setFreshMoney}
            onCapChange={setSingleStockCap}
          />

          <AllocationChart holdings={metrics.holdingsWithMetrics} />
        </section>

        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <HoldingsTable
            holdings={metrics.holdingsWithMetrics}
            onUpdate={updateHolding}
            onRemove={removeHolding}
          />

          <ActionBar
            onAddHolding={addHolding}
            onAutoSplit={handleAutoSplit}
            onClearAdditions={clearAdditions}
            onLoadExample={loadExample}
            onClearAll={clearAll}
            onExportCSV={exportCSV}
            hasHoldings={holdings.length > 0}
          />

          <FooterNote metrics={metrics} />
        </section>
      </main>
    </div>
  );
}