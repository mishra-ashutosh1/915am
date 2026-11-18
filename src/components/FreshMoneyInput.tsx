import { FormattedNumberInput } from './FormattedNumberInput';
import { formatIndianWords } from '../utils';

interface FreshMoneyInputProps {
  freshMoney: number;
  singleStockCap: number;
  onFreshMoneyChange: (value: number) => void;
  onCapChange: (value: number) => void;
}

const QUICK_AMOUNTS = [
  { label: '+₹10k', value: 10000 },
  { label: '+₹25k', value: 25000 },
  { label: '+₹50k', value: 50000 },
  { label: '+₹1L', value: 100000 },
  { label: '+₹5L', value: 500000 },
];

export function FreshMoneyInput({
  freshMoney,
  singleStockCap,
  onFreshMoneyChange,
  onCapChange,
}: FreshMoneyInputProps) {
  const words = formatIndianWords(freshMoney);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="fresh-money-input" className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
            Fresh Money to Invest (₹)
          </label>
          {words && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {words}
            </span>
          )}
        </div>
        <FormattedNumberInput
          id="fresh-money-input"
          value={freshMoney}
          onChange={onFreshMoneyChange}
          placeholder="e.g. 1,00,000"
          ariaLabel="Fresh money to invest"
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-0.5">Quick add:</span>
          {QUICK_AMOUNTS.map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => onFreshMoneyChange(freshMoney + value)}
              className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors cursor-pointer"
            >
              {label}
            </button>
          ))}
          {freshMoney > 0 && (
            <button
              type="button"
              onClick={() => onFreshMoneyChange(0)}
              className="text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="single-stock-cap-input" className="block text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
          Single-Stock Limit (%)
        </label>
        <FormattedNumberInput
          id="single-stock-cap-input"
          value={singleStockCap}
          onChange={onCapChange}
          placeholder="10"
          min={0}
          max={100}
          step={0.5}
          formatWithCommas={false}
          ariaLabel="Single stock limit percentage"
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Highlights any individual stock exceeding this portfolio threshold after planned additions.
        </p>
      </div>
    </div>
  );
}
