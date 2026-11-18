import { num } from '../utils';

interface FreshMoneyInputProps {
  freshMoney: number;
  singleStockCap: number;
  onFreshMoneyChange: (value: number) => void;
  onCapChange: (value: number) => void;
}

export function FreshMoneyInput({
  freshMoney,
  singleStockCap,
  onFreshMoneyChange,
  onCapChange,
}: FreshMoneyInputProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
          Fresh Money to Invest (₹)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={freshMoney}
          onChange={(e) => onFreshMoneyChange(num(e.target.value))}
          placeholder="0"
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
          Single-Stock Limit (%)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={singleStockCap}
          onChange={(e) => onCapChange(num(e.target.value))}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}