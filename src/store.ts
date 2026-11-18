import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Holding, PortfolioState } from './types';
import { createEmptyHolding, EXAMPLE_HOLDINGS, num } from './utils';

interface PortfolioStore extends PortfolioState {
  addHolding: () => void;
  removeHolding: (id: string) => void;
  updateHolding: (id: string, field: keyof Holding, value: string | number) => void;
  setFreshMoney: (value: number) => void;
  setSingleStockCap: (value: number) => void;
  clearAdditions: () => void;
  loadExample: () => void;
  clearAll: () => void;
  autoSplitFreshMoney: () => { success: boolean; message: string };
  exportCSV: () => void;
  importHoldings: (newHoldings: Holding[], mode: 'replace' | 'append') => void;
}

const initialState: PortfolioState = {
  holdings: [],
  freshMoney: 0,
  singleStockCap: 10,
};

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addHolding: () => set(state => ({
        holdings: [...state.holdings, createEmptyHolding()],
      })),

      removeHolding: (id: string) => set(state => ({
        holdings: state.holdings.filter(h => h.id !== id),
      })),

      updateHolding: (id: string, field: keyof Holding, value: string | number) => set(state => ({
        holdings: state.holdings.map(h =>
          h.id === id ? { ...h, [field]: field === 'name' || field === 'type' ? value : num(value) } : h
        ),
      })),

      setFreshMoney: (value: number) => set({ freshMoney: value }),

      setSingleStockCap: (value: number) => set({ singleStockCap: value }),

      clearAdditions: () => set(state => ({
        holdings: state.holdings.map(h => ({ ...h, add: 0 })),
      })),

      loadExample: () => set({ holdings: EXAMPLE_HOLDINGS }),

      clearAll: () => set({ ...initialState, holdings: [] }),

      autoSplitFreshMoney: () => {
        const { holdings, freshMoney } = get();
        if (!freshMoney) return { success: false, message: 'Enter the fresh money amount first.' };
        
        const totalCurrent = holdings.reduce((s, h) => s + Number(h.value) || 0, 0);
        const totalAfter = totalCurrent + freshMoney;
        
        const needs = holdings.map(h => {
          const target = Number(h.target) || 0;
          if (target <= 0) return 0;
          return Math.max(0, (target / 100) * totalAfter - (Number(h.value) || 0));
        });
        
        const sumNeeds = needs.reduce((a, b) => a + b, 0);
        if (!sumNeeds) return { success: false, message: 'Set a target % on at least one holding that is below its target.' };
        
        const factor = Math.min(1, freshMoney / sumNeeds);
        
        set(state => ({
          holdings: state.holdings.map((h, i) => ({
            ...h,
            add: needs[i] > 0 ? Math.round(needs[i] * factor) : 0,
          })),
        }));
        
        const message = sumNeeds < freshMoney
          ? `Every gap is filled. ₹${Math.round(freshMoney - sumNeeds).toLocaleString('en-IN')} is left to place.`
          : 'Split in proportion to each holding\'s shortfall.';
        
        return { success: true, message };
      },

      exportCSV: () => {
        const { holdings, freshMoney, singleStockCap } = get();
        const headers = ['Name', 'Type', 'Current Value (₹)', 'Add (₹)', 'Target %'];
        const rows = holdings.map(h => [
          h.name,
          h.type,
          h.value.toString(),
          h.add.toString(),
          h.target.toString(),
        ]);
        rows.push(['', '', '', 'Fresh Money', freshMoney.toString()]);
        rows.push(['', '', '', 'Single Stock Cap %', singleStockCap.toString()]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'allocation-plan.csv';
        a.click();
        URL.revokeObjectURL(url);
      },

      importHoldings: (newHoldings: Holding[], mode: 'replace' | 'append') => set(state => ({
        holdings: mode === 'replace' ? newHoldings : [...state.holdings, ...newHoldings],
      })),
    }),
    {
      name: 'alloc-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        holdings: state.holdings,
        freshMoney: state.freshMoney,
        singleStockCap: state.singleStockCap,
      }),
    }
  )
);
