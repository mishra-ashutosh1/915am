import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePortfolioActions } from './usePortfolioActions';
import { usePortfolioStore } from '../store';

describe('usePortfolioActions hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    usePortfolioStore.setState({
      holdings: [],
      freshMoney: 0,
      singleStockCap: 10,
    });
  });

  it('adds an empty holding', () => {
    const { result } = renderHook(() => usePortfolioActions());
    act(() => {
      result.current.addHolding();
    });
    expect(result.current.holdings).toHaveLength(1);
    expect(result.current.holdings[0].name).toBe('');
    expect(result.current.holdings[0].value).toBe(0);
  });

  it('updates holding fields with strings, numbers and Indian formatted values without dropping updates', () => {
    const { result } = renderHook(() => usePortfolioActions());
    
    act(() => {
      result.current.addHolding();
    });
    const id = result.current.holdings[0].id;

    // Test text name
    act(() => {
      result.current.updateHolding(id, 'name', 'Nifty 50 Index Fund');
    });
    expect(result.current.holdings[0].name).toBe('Nifty 50 Index Fund');

    // Test clearing name with empty string
    act(() => {
      result.current.updateHolding(id, 'name', '');
    });
    expect(result.current.holdings[0].name).toBe('');

    // Test updating value with numeric string (simulating input onChange)
    act(() => {
      result.current.updateHolding(id, 'value', '250000');
    });
    expect(result.current.holdings[0].value).toBe(250000);

    // Test updating value with comma formatted string
    act(() => {
      result.current.updateHolding(id, 'value', '1,50,000');
    });
    expect(result.current.holdings[0].value).toBe(150000);

    // Test updating add
    act(() => {
      result.current.updateHolding(id, 'add', '50000');
    });
    expect(result.current.holdings[0].add).toBe(50000);

    // Test updating target
    act(() => {
      result.current.updateHolding(id, 'target', '35.5');
    });
    expect(result.current.holdings[0].target).toBe(35.5);

    // Test updating type
    act(() => {
      result.current.updateHolding(id, 'type', 'MF');
    });
    expect(result.current.holdings[0].type).toBe('MF');
  });

  it('removes holding by id', () => {
    const { result } = renderHook(() => usePortfolioActions());
    act(() => {
      result.current.addHolding();
    });
    const id = result.current.holdings[0].id;

    act(() => {
      result.current.removeHolding(id);
    });
    expect(result.current.holdings).toHaveLength(0);
  });

  it('sets fresh money and single stock cap', () => {
    const { result } = renderHook(() => usePortfolioActions());

    act(() => {
      result.current.setFreshMoney(100000);
      result.current.setSingleStockCap(15);
    });

    expect(result.current.freshMoney).toBe(100000);
    expect(result.current.singleStockCap).toBe(15);
  });

  it('imports holdings in replace and append modes', () => {
    const { result } = renderHook(() => usePortfolioActions());

    act(() => {
      result.current.importHoldings(
        [{ id: 'h1', name: 'Stock 1', value: 10000, add: 0, target: 10, type: 'Stock' }],
        'replace'
      );
    });
    expect(result.current.holdings).toHaveLength(1);

    act(() => {
      result.current.importHoldings(
        [{ id: 'h2', name: 'Fund 2', value: 20000, add: 0, target: 20, type: 'MF' }],
        'append'
      );
    });
    expect(result.current.holdings).toHaveLength(2);
  });
});
