import type { Holding } from '../types';

export interface HoldingWithMetrics extends Holding {
  nowPct: number;
  afterPct: number;
  need: string;
  needClass: 'warn' | 'bad' | 'ok' | 'mute';
  overLimit: boolean;
  color: string;
}

export interface CalculatedMetrics {
  totalCurrent: number;
  totalAdditions: number;
  totalAfter: number;
  freshRemaining: number;
  holdingsWithMetrics: HoldingWithMetrics[];
  targetsSum: number;
}

export const HOLDING_TYPES = ['Stock', 'MF', 'ETF', 'Gold', 'Debt', 'Cash'] as const;
export type HoldingType = typeof HOLDING_TYPES[number];