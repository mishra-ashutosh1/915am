import { useCallback } from 'react';
import { usePortfolioStore } from '../store';
import { holdingSchema, portfolioSchema } from '../schemas/validation';
import type { Holding } from '../types';

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
      const result = holdingSchema.shape[field]?.safeParse?.(value);
      if (result && !result.success) {
        console.warn(`Invalid value for ${field}:`, result.error);
        return;
      }
      updateHolding(id, field, value);
    },
    [updateHolding]
  );

  const handleSetFreshMoney = useCallback(
    (value: number) => {
      const result = portfolioSchema.shape.freshMoney.safeParse(value);
      if (!result.success) return;
      setFreshMoney(value);
    },
    [setFreshMoney]
  );

  const handleSetSingleStockCap = useCallback(
    (value: number) => {
      const result = portfolioSchema.shape.singleStockCap.safeParse(value);
      if (!result.success) return;
      setSingleStockCap(value);
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
  };
}