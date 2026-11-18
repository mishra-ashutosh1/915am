import { useCallback } from 'react';
import { usePortfolioStore } from '../store';
import { holdingSchema, portfolioSchema } from '../schemas/validation';
import type { Holding } from '../types';
import { num } from '../utils';

export function usePortfolioActions() {
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
    importHoldings,
  } = usePortfolioStore();

  const handleAddHolding = useCallback(() => {
    addHolding();
  }, [addHolding]);

  const handleRemoveHolding = useCallback(
    (id: string) => {
      removeHolding(id);
    },
    [removeHolding]
  );

  const handleUpdateHolding = useCallback(
    (id: string, field: keyof Holding, value: string | number) => {
      const sanitized = field === 'name' || field === 'type' ? value : num(value);
      const validator = holdingSchema.shape[field];
      if (validator) {
        const result = validator.safeParse(sanitized);
        if (!result.success) {
          console.warn(`Invalid value for ${field}:`, result.error);
          return;
        }
      }
      updateHolding(id, field, sanitized);
    },
    [updateHolding]
  );

  const handleSetFreshMoney = useCallback(
    (value: number | string) => {
      const parsed = num(value);
      const result = portfolioSchema.shape.freshMoney.safeParse(parsed);
      if (!result.success) return;
      setFreshMoney(parsed);
    },
    [setFreshMoney]
  );

  const handleSetSingleStockCap = useCallback(
    (value: number | string) => {
      const parsed = num(value);
      const result = portfolioSchema.shape.singleStockCap.safeParse(parsed);
      if (!result.success) return;
      setSingleStockCap(parsed);
    },
    [setSingleStockCap]
  );

  const handleClearAdditions = useCallback(() => {
    clearAdditions();
  }, [clearAdditions]);

  const handleLoadExample = useCallback(() => {
    loadExample();
  }, [loadExample]);

  const handleClearAll = useCallback(() => {
    clearAll();
  }, [clearAll]);

  const handleAutoSplit = useCallback(() => {
    return autoSplitFreshMoney();
  }, [autoSplitFreshMoney]);

  const handleExportCSV = useCallback(() => {
    exportCSV();
  }, [exportCSV]);

  const handleImportHoldings = useCallback(
    (newHoldings: Holding[], mode: 'replace' | 'append') => {
      importHoldings(newHoldings, mode);
    },
    [importHoldings]
  );

  return {
    holdings,
    freshMoney,
    singleStockCap,
    addHolding: handleAddHolding,
    removeHolding: handleRemoveHolding,
    updateHolding: handleUpdateHolding,
    setFreshMoney: handleSetFreshMoney,
    setSingleStockCap: handleSetSingleStockCap,
    clearAdditions: handleClearAdditions,
    loadExample: handleLoadExample,
    clearAll: handleClearAll,
    autoSplitFreshMoney: handleAutoSplit,
    exportCSV: handleExportCSV,
    importHoldings: handleImportHoldings,
  };
}
