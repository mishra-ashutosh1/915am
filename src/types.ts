export type HoldingType = 'Stock' | 'MF' | 'ETF' | 'Gold' | 'Debt' | 'Cash';

export const HOLDING_TYPES: HoldingType[] = ['Stock', 'MF', 'ETF', 'Gold', 'Debt', 'Cash'];

export interface Holding {
  id: string;
  name: string;
  value: number;
  add: number;
  target: number;
  type: HoldingType;
}

export interface PortfolioState {
  holdings: Holding[];
  freshMoney: number;
  singleStockCap: number;
}

export interface CalculatedMetrics {
  totalCurrent: number;
  totalAdditions: number;
  totalAfter: number;
  freshRemaining: number;
  holdingsWithMetrics: Array<Holding & {
    nowPct: number;
    afterPct: number;
    need: string;
    needClass: 'warn' | 'bad' | 'ok' | 'mute';
    overLimit: boolean;
    color: string;
  }>;
  targetsSum: number;
}