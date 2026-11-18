import type { Holding, HoldingType, CalculatedMetrics } from './types';
import { HOLDING_TYPES } from './types';

export const fmt = (n: number): string => {
  const rounded = Math.round(n);
  if (rounded < 0) {
    return '-₹' + Math.abs(rounded).toLocaleString('en-IN');
  }
  return '₹' + rounded.toLocaleString('en-IN');
};

export const pc = (n: number): string => 
  (isFinite(n) ? n : 0).toFixed(1) + '%';

export const num = (v: string | number): number => {
  const x = parseFloat(String(v).replace(/,/g, ''));
  return isFinite(x) && x > 0 ? x : 0;
};

export const formatIndianWords = (amount: number): string => {
  const n = Math.abs(Math.round(amount));
  if (n === 0) return '';
  if (n >= 10000000) {
    const cr = parseFloat((n / 10000000).toFixed(2));
    return `${cr} Cr`;
  }
  if (n >= 100000) {
    const lk = parseFloat((n / 100000).toFixed(2));
    return `${lk} Lakh`;
  }
  if (n >= 1000) {
    const k = parseFloat((n / 1000).toFixed(1));
    return `${k}k`;
  }
  return '';
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

export interface ParsedCSVResult {
  holdings: Holding[];
  freshMoney?: number;
  singleStockCap?: number;
  error?: string;
}

const parseCSVLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const inferHoldingType = (typeName?: string, holdingName?: string): HoldingType => {
  const t = (typeName || '').trim();
  const matched = HOLDING_TYPES.find(ht => ht.toLowerCase() === t.toLowerCase());
  if (matched) return matched;

  const combined = `${typeName || ''} ${holdingName || ''}`.toLowerCase();
  if (combined.includes('gold') || combined.includes('silver') || combined.includes('sovereign')) return 'Gold';
  if (combined.includes('debt') || combined.includes('bond') || combined.includes('gilt') || combined.includes('liquid') || combined.includes('overnight') || combined.includes('arbitrage')) return 'Debt';
  if (combined.includes('etf')) return 'ETF';
  if (combined.includes('fund') || combined.includes('growth') || combined.includes('direct') || combined.includes('regular') || combined.includes('flexi') || combined.includes('index') || combined.includes('mf')) return 'MF';
  if (combined.includes('cash') || combined.includes('bank') || combined.includes('savings')) return 'Cash';
  return 'Stock';
};

export const parseHoldingsCSV = (csvText: string): ParsedCSVResult => {
  if (!csvText || !csvText.trim()) {
    return { holdings: [], error: 'The provided data is empty.' };
  }

  const lines = csvText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    return { holdings: [], error: 'No valid lines found.' };
  }

  // Detect delimiter: tab or comma or semicolon
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const delimiter = tabCount > 1 ? '\t' : semicolonCount > 1 ? ';' : ',';

  const rows = lines.map(line => parseCSVLine(line, delimiter));

  // Check if first row is header
  const headerCandidates = rows[0].map(c => c.toLowerCase().replace(/[^a-z0-9%]/g, ''));
  
  let nameCol = -1;
  let typeCol = -1;
  let valCol = -1;
  let addCol = -1;
  let targetCol = -1;

  headerCandidates.forEach((h, idx) => {
    if (nameCol === -1 && (h.includes('name') || h.includes('scheme') || h.includes('fund') || h.includes('stock') || h.includes('symbol') || h.includes('security') || h.includes('holding') || h.includes('description'))) {
      nameCol = idx;
    } else if (typeCol === -1 && (h.includes('type') || h.includes('assetclass') || h.includes('category'))) {
      typeCol = idx;
    } else if (valCol === -1 && (h.includes('value') || h.includes('amount') || h.includes('invested') || h.includes('current'))) {
      valCol = idx;
    } else if (addCol === -1 && (h.includes('add') || h.includes('fresh') || h.includes('planned'))) {
      addCol = idx;
    } else if (targetCol === -1 && (h.includes('target') || h.includes('allocation') || h.includes('weight'))) {
      targetCol = idx;
    }
  });

  const isHeaderPresent = nameCol !== -1 || valCol !== -1;
  const startRowIndex = isHeaderPresent ? 1 : 0;

  // Defaults if header not detected
  if (!isHeaderPresent) {
    nameCol = 0;
    typeCol = 1;
    valCol = 2;
    addCol = 3;
    targetCol = 4;
  }

  const holdings: Holding[] = [];
  let parsedFreshMoney: number | undefined;
  let parsedCap: number | undefined;

  for (let i = startRowIndex; i < rows.length; i++) {
    const row = rows[i];
    const joined = row.join(' ').toLowerCase();

    // Check for footer summary rows like "Fresh Money" or "Single Stock Cap"
    if (joined.includes('fresh money')) {
      const numMatch = row.find(cell => num(cell) > 0);
      if (numMatch) parsedFreshMoney = num(numMatch);
      continue;
    }
    if (joined.includes('single stock cap') || joined.includes('cap %')) {
      const numMatch = row.find(cell => num(cell) > 0);
      if (numMatch) parsedCap = num(numMatch);
      continue;
    }

    const name = (row[nameCol] || '').replace(/^["']|["']$/g, '').trim();
    if (!name) continue;

    const rawType = typeCol !== -1 && row[typeCol] ? row[typeCol] : '';
    const holdingType = inferHoldingType(rawType, name);

    const value = valCol !== -1 && row[valCol] ? num(row[valCol]) : 0;
    const add = addCol !== -1 && row[addCol] ? num(row[addCol]) : 0;
    const target = targetCol !== -1 && row[targetCol] ? num(row[targetCol]) : 0;

    holdings.push({
      id: generateId(),
      name,
      type: holdingType,
      value,
      add,
      target,
    });
  }

  if (holdings.length === 0) {
    return { holdings: [], error: 'Could not extract any valid holdings from the data.' };
  }

  return {
    holdings,
    freshMoney: parsedFreshMoney,
    singleStockCap: parsedCap,
  };
};
