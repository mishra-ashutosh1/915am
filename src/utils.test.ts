import { describe, it, expect, vi } from 'vitest';
import { fmt, pc, num, calculateMetrics, autoSplit, exportToCSV, downloadFile, generateId } from './utils';
import type { Holding } from './types';

describe('utils', () => {
  describe('fmt', () => {
    it('formats numbers with Indian locale', () => {
      expect(fmt(1000)).toBe('₹1,000');
      expect(fmt(100000)).toBe('₹1,00,000');
      expect(fmt(1234567.89)).toBe('₹12,34,568');
      expect(fmt(0)).toBe('₹0');
    });

    it('handles negative numbers', () => {
      expect(fmt(-50000)).toBe('₹-50,000');
    });
  });

  describe('pc', () => {
    it('formats percentages with 1 decimal place', () => {
      expect(pc(10)).toBe('10.0%');
      expect(pc(10.5)).toBe('10.5%');
      expect(pc(0)).toBe('0.0%');
      expect(pc(100)).toBe('100.0%');
    });

    it('handles NaN and Infinity', () => {
      expect(pc(NaN)).toBe('0.0%');
      expect(pc(Infinity)).toBe('0.0%');
    });
  });

  describe('num', () => {
    it('parses valid numbers', () => {
      expect(num('1000')).toBe(1000);
      expect(num('1,00,000')).toBe(100000);
      expect(num(50000)).toBe(50000);
      expect(num('0')).toBe(0);
    });

    it('returns 0 for invalid inputs', () => {
      expect(num('abc')).toBe(0);
      expect(num('')).toBe(0);
      expect(num(null as any)).toBe(0);
      expect(num(undefined as any)).toBe(0);
      expect(num(-100)).toBe(0);
      expect(num(NaN)).toBe(0);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it('generates IDs of expected format', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]{7}$/);
    });
  });

  describe('calculateMetrics', () => {
    const mockHoldings: Holding[] = [
      { id: '1', name: 'Stock A', value: 100000, add: 50000, target: 60, type: 'Stock' },
      { id: '2', name: 'Fund B', value: 200000, add: 0, target: 40, type: 'MF' },
    ];

    it('calculates totals correctly', () => {
      const metrics = calculateMetrics(mockHoldings, 50000, 10);
      expect(metrics.totalCurrent).toBe(300000);
      expect(metrics.totalAdditions).toBe(50000);
      expect(metrics.totalAfter).toBe(350000);
      expect(metrics.freshRemaining).toBe(0);
    });

    it('calculates percentages correctly', () => {
      const metrics = calculateMetrics(mockHoldings, 50000, 10);
      const stock = metrics.holdingsWithMetrics.find((h) => h.id === '1');
      const fund = metrics.holdingsWithMetrics.find((h) => h.id === '2');

      expect(stock?.nowPct).toBeCloseTo(33.3, 1);
      expect(stock?.afterPct).toBeCloseTo(42.9, 1);
      expect(fund?.nowPct).toBeCloseTo(66.7, 1);
      expect(fund?.afterPct).toBeCloseTo(57.1, 1);
    });

    it('calculates need correctly for on-target holding', () => {
      const holdings: Holding[] = [
        { id: '1', name: 'A', value: 100000, add: 0, target: 50, type: 'Stock' },
        { id: '2', name: 'B', value: 100000, add: 0, target: 50, type: 'MF' },
      ];
      const metrics = calculateMetrics(holdings, 0, 10);
      expect(metrics.holdingsWithMetrics[0].needClass).toBe('ok');
      expect(metrics.holdingsWithMetrics[0].need).toBe('on target');
    });

    it('calculates need correctly for under-target holding', () => {
      const holdings: Holding[] = [
        { id: '1', name: 'A', value: 50000, add: 0, target: 60, type: 'Stock' },
        { id: '2', name: 'B', value: 150000, add: 0, target: 40, type: 'MF' },
      ];
      const metrics = calculateMetrics(holdings, 0, 10);
      expect(metrics.holdingsWithMetrics[0].needClass).toBe('warn');
      expect(metrics.holdingsWithMetrics[0].need).toContain('+');
    });

    it('calculates need correctly for over-target holding', () => {
      const holdings: Holding[] = [
        { id: '1', name: 'A', value: 150000, add: 0, target: 40, type: 'Stock' },
        { id: '2', name: 'B', value: 50000, add: 0, target: 60, type: 'MF' },
      ];
      const metrics = calculateMetrics(holdings, 0, 10);
      expect(metrics.holdingsWithMetrics[0].needClass).toBe('bad');
      expect(metrics.holdingsWithMetrics[0].need).toContain('above');
    });

    it('flags over-limit for stocks exceeding cap', () => {
      const holdings: Holding[] = [
        { id: '1', name: 'A', value: 150000, add: 100000, target: 60, type: 'Stock' },
        { id: '2', name: 'B', value: 50000, add: 0, target: 40, type: 'MF' },
      ];
      const metrics = calculateMetrics(holdings, 100000, 50);
      const stock = metrics.holdingsWithMetrics.find((h) => h.id === '1');
      expect(stock?.overLimit).toBe(true);
    });

    it('does not flag non-stocks for over-limit', () => {
      const holdings: Holding[] = [
        { id: '1', name: 'A', value: 150000, add: 100000, target: 60, type: 'MF' },
      ];
      const metrics = calculateMetrics(holdings, 100000, 50);
      expect(metrics.holdingsWithMetrics[0].overLimit).toBe(false);
    });

    it('assigns colors to holdings', () => {
      const metrics = calculateMetrics(mockHoldings, 50000, 10);
      expect(metrics.holdingsWithMetrics[0].color).toBeDefined();
      expect(metrics.holdingsWithMetrics[1].color).toBeDefined();
    });

    it('sums targets correctly', () => {
      const metrics = calculateMetrics(mockHoldings, 50000, 10);
      expect(metrics.targetsSum).toBe(100);
    });
  });

  describe('autoSplit', () => {
    it('splits fresh money proportionally to shortfall', () => {
      const holdings: Holding[] = [
        { id: '1', name: 'A', value: 50000, add: 0, target: 60, type: 'Stock' },
        { id: '2', name: 'B', value: 150000, add: 0, target: 40, type: 'MF' },
      ];
      const result = autoSplit(holdings, 100000);
      expect(result[0].add).toBeGreaterThan(0);
      expect(result[1].add).toBe(0);
      expect(result[0].add + result[1].add).toBeLessThanOrEqual(100000);
    });

    it('returns unchanged holdings when no targets set', () => {
      const holdings: Holding[] = [
        { id: '1', name: 'A', value: 100000, add: 0, target: 0, type: 'Stock' },
      ];
      const result = autoSplit(holdings, 50000);
      expect(result).toEqual(holdings);
    });

    it('does not exceed fresh money amount', () => {
      const holdings: Holding[] = [
        { id: '1', name: 'A', value: 10000, add: 0, target: 50, type: 'Stock' },
        { id: '2', name: 'B', value: 10000, add: 0, target: 50, type: 'MF' },
      ];
      const result = autoSplit(holdings, 1000);
      const totalAdd = result.reduce((s, h) => s + h.add, 0);
      expect(totalAdd).toBeLessThanOrEqual(1000);
    });
  });

  describe('exportToCSV', () => {
    it('generates valid CSV with headers', () => {
      const holdings: Holding[] = [
        { id: '1', name: 'Stock A', value: 100000, add: 50000, target: 60, type: 'Stock' },
      ];
      const csv = exportToCSV(holdings, 50000, 10);
      const lines = csv.split('\n');
      expect(lines[0]).toContain('"Name","Type","Current Value (₹)","Add (₹)","Target %"');
      expect(lines[1]).toContain('"Stock A"');
      expect(lines[2]).toContain('"Fresh Money"');
      expect(lines[3]).toContain('"Single Stock Cap %"');
    });
  });

  describe('downloadFile', () => {
    it('creates blob and triggers download', () => {
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

      downloadFile('test content', 'test.csv', 'text/csv');

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });
  });
});