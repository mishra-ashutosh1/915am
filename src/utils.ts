import type { Holding, CalculatedMetrics } from './types';

export const fmt = (n: number): string => 
  '₹' + Math.round(n).toLocaleString('en-IN');

export const pc = (n: number): string => 
  (isFinite(n) ? n : 0).toFixed(1) + '%';

export const num = (v: string | number): number => {
  const x = parseFloat(String(v).replace(/,/g, ''));
  return isFinite(x) && x > 0 ? x : 0;
};

export const generateId = (): string => 
  Math.random().toString(36).slice(2, 9);

export const COLORS = [
  'hsl(215 52% 46%)', 'hsl(268 52% 46%)', 'hsl(321 52% 46%)',
  'hsl(14 52% 46%)', 'hsl(67 52% 46%)', 'hsl(120 52% 46%)',
  'hsl(173 52% 46%)', 'hsl(226 52% 46%)', 'hsl(279 52% 46%)',
  'hsl(332 52% 46%)', 'hsl(25 52% 46%)', 'hsl(78 52% 46%)',
];

export const getColor = (index: number): string => COLORS[index % COLORS.length];

export const createEmptyHolding = (): Holding => ({
  id: generateId(),
  name: '',
  value: 0,
  add: 0,
  target: 0,
  type: 'Stock',
});

export const EXAMPLE_HOLDINGS: Holding[] = [
  { id: generateId(), name: 'Example stock A', value: 150000, add: 0, target: 8, type: 'Stock' },
  { id: generateId(), name: 'Example flexi-cap fund', value: 300000, add: 0, target: 40, type: 'MF' },
  { id: generateId(), name: 'Example index fund', value: 200000, add: 0, target: 30, type: 'MF' },
  { id: generateId(), name: 'Example stock B', value: 50000, add: 0, target: 5, type: 'Stock' },
  { id: generateId(), name: 'Example gold ETF', value: 100000, add: 0, target: 10, type: 'ETF' },
];

export const calculateMetrics = (holdings: Holding[], freshMoney: number, singleStockCap: number): CalculatedMetrics => {
  const totalCurrent = holdings.reduce((s, h) => s + num(h.value), 0);
  const totalAdditions = holdings.reduce((s, h) => s + num(h.add), 0);
  const totalAfter = totalCurrent + totalAdditions;
  const freshRemaining = freshMoney - totalAdditions;

  const holdingsWithMetrics = holdings.map((h, i) => {
    const V = num(h.value);
    const a = num(h.add);
    const w = num(h.target) / 100;

    const nowPct = totalCurrent ? (V / totalCurrent) * 100 : 0;
    const afterPct = totalAfter ? ((V + a) / totalAfter) * 100 : 0;
    const overLimit = Boolean(h.type === 'Stock' && singleStockCap && afterPct > singleStockCap + 0.05);

    let need = '—';
    let needClass: 'warn' | 'bad' | 'ok' | 'mute' = 'mute';

    if (w > 0 && w < 1 && totalCurrent) {
      const x = (w * totalCurrent - V) / (1 - w);
      const over = V - w * totalCurrent;
      if (x > 0.5) {
        need = '+' + fmt(x);
        needClass = 'warn';
      } else if (over > 0.5) {
        need = fmt(over) + ' above';
        needClass = 'bad';
      } else {
        need = 'on target';
        needClass = 'ok';
      }
    } else if (w >= 1) {
      need = 'use under 100%';
      needClass = 'bad';
    }

    return { ...h, nowPct, afterPct, need, needClass, overLimit, color: getColor(i) };
  });

  const targetsSum = holdings.reduce((s, h) => s + num(h.target), 0);

  return {
    totalCurrent,
    totalAdditions,
    totalAfter,
    freshRemaining,
    holdingsWithMetrics,
    targetsSum,
  };
};

export const autoSplit = (holdings: Holding[], freshMoney: number): Holding[] => {
  const totalCurrent = holdings.reduce((s, h) => s + num(h.value), 0);
  const totalAfter = totalCurrent + freshMoney;

  const needs = holdings.map(h => {
    const target = num(h.target);
    if (target <= 0) return 0;
    const needed = Math.max(0, (target / 100) * totalAfter - num(h.value));
    return needed;
  });

  const sumNeeds = needs.reduce((a, b) => a + b, 0);
  if (!sumNeeds) return holdings;

  const factor = Math.min(1, freshMoney / sumNeeds);

  return holdings.map((h, i) => ({
    ...h,
    add: needs[i] > 0 ? Math.round(needs[i] * factor) : 0,
  }));
};

export const loadFromStorage = (): { holdings: Holding[]; freshMoney: number; singleStockCap: number } | null => {
  try {
    const data = localStorage.getItem('alloc-v1');
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed.holdings)) return null;
    return {
      holdings: parsed.holdings,
      freshMoney: parsed.fresh ?? 0,
      singleStockCap: parsed.cap ?? 10,
    };
  } catch {
    return null;
  }
};

export const saveToStorage = (holdings: Holding[], freshMoney: number, singleStockCap: number): void => {
  try {
    localStorage.setItem('alloc-v1', JSON.stringify({ holdings, fresh: freshMoney, cap: singleStockCap }));
  } catch {}
};

export const exportToCSV = (holdings: Holding[], freshMoney: number, singleStockCap: number): string => {
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
  return [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
};

export const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};