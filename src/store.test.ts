import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePortfolioStore } from './store';
import { EXAMPLE_HOLDINGS } from './utils';

describe('store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    usePortfolioStore.setState({
      holdings: [],
      freshMoney: 0,
      singleStockCap: 10,
    });
  });

  describe('addHolding', () => {
    it('adds a new empty holding', () => {
      const initialCount = usePortfolioStore.getState().holdings.length;
      usePortfolioStore.getState().addHolding();
      const newCount = usePortfolioStore.getState().holdings.length;
      expect(newCount).toBe(initialCount + 1);
    });

    it('adds holding with correct default structure', () => {
      usePortfolioStore.getState().addHolding();
      const holdings = usePortfolioStore.getState().holdings;
      const newHolding = holdings[holdings.length - 1];
      expect(newHolding).toMatchObject({
        name: '',
        value: 0,
        add: 0,
        target: 0,
        type: 'Stock',
      });
      expect(newHolding.id).toBeDefined();
    });
  });

  describe('removeHolding', () => {
    it('removes holding by id', () => {
      usePortfolioStore.getState().addHolding();
      const id = usePortfolioStore.getState().holdings[0].id;
      usePortfolioStore.getState().removeHolding(id);
      expect(usePortfolioStore.getState().holdings).toHaveLength(0);
    });

    it('does nothing for non-existent id', () => {
      usePortfolioStore.getState().addHolding();
      usePortfolioStore.getState().removeHolding('non-existent');
      expect(usePortfolioStore.getState().holdings).toHaveLength(1);
    });
  });

  describe('updateHolding', () => {
    it('updates holding fields correctly', () => {
      usePortfolioStore.getState().addHolding();
      const id = usePortfolioStore.getState().holdings[0].id;

      usePortfolioStore.getState().updateHolding(id, 'name', 'Test Fund');
      usePortfolioStore.getState().updateHolding(id, 'value', '100000');
      usePortfolioStore.getState().updateHolding(id, 'type', 'MF');

      const holding = usePortfolioStore.getState().holdings[0];
      expect(holding.name).toBe('Test Fund');
      expect(holding.value).toBe(100000);
      expect(holding.type).toBe('MF');
    });

    it('coerces numeric strings to numbers', () => {
      usePortfolioStore.getState().addHolding();
      const id = usePortfolioStore.getState().holdings[0].id;

      usePortfolioStore.getState().updateHolding(id, 'value', '1,00,000');
      usePortfolioStore.getState().updateHolding(id, 'target', '60.5');

      const holding = usePortfolioStore.getState().holdings[0];
      expect(holding.value).toBe(100000);
      expect(holding.target).toBe(60.5);
    });

    it('handles invalid numeric input gracefully', () => {
      usePortfolioStore.getState().addHolding();
      const id = usePortfolioStore.getState().holdings[0].id;

      usePortfolioStore.getState().updateHolding(id, 'value', 'abc');
      usePortfolioStore.getState().updateHolding(id, 'add', '-100');

      const holding = usePortfolioStore.getState().holdings[0];
      expect(holding.value).toBe(0);
      expect(holding.add).toBe(0);
    });
  });

  describe('setFreshMoney', () => {
    it('sets fresh money value', () => {
      usePortfolioStore.getState().setFreshMoney(50000);
      expect(usePortfolioStore.getState().freshMoney).toBe(50000);
    });

    it('accepts zero', () => {
      usePortfolioStore.getState().setFreshMoney(0);
      expect(usePortfolioStore.getState().freshMoney).toBe(0);
    });
  });

  describe('setSingleStockCap', () => {
    it('sets single stock cap', () => {
      usePortfolioStore.getState().setSingleStockCap(25);
      expect(usePortfolioStore.getState().singleStockCap).toBe(25);
    });
  });

  describe('clearAdditions', () => {
    it('resets add field for all holdings', () => {
      usePortfolioStore.setState({
        holdings: [
          { id: '1', name: 'A', value: 100000, add: 50000, target: 60, type: 'Stock' },
          { id: '2', name: 'B', value: 200000, add: 30000, target: 40, type: 'MF' },
        ],
        freshMoney: 0,
        singleStockCap: 10,
      });

      usePortfolioStore.getState().clearAdditions();

      const holdings = usePortfolioStore.getState().holdings;
      expect(holdings[0].add).toBe(0);
      expect(holdings[1].add).toBe(0);
    });
  });

  describe('loadExample', () => {
    it('loads example holdings', () => {
      usePortfolioStore.getState().loadExample();
      const holdings = usePortfolioStore.getState().holdings;
      expect(holdings).toHaveLength(EXAMPLE_HOLDINGS.length);
      expect(holdings[0].name).toBe('Example stock A');
      expect(holdings[1].name).toBe('Example flexi-cap fund');
    });

    it('replaces existing holdings', () => {
      usePortfolioStore.getState().addHolding();
      usePortfolioStore.getState().loadExample();
      expect(usePortfolioStore.getState().holdings).toHaveLength(EXAMPLE_HOLDINGS.length);
    });
  });

  describe('clearAll', () => {
    it('clears all holdings and resets fresh money', () => {
      usePortfolioStore.setState({
        holdings: [{ id: '1', name: 'A', value: 100000, add: 0, target: 0, type: 'Stock' }],
        freshMoney: 50000,
        singleStockCap: 15,
      });

      usePortfolioStore.getState().clearAll();

      const state = usePortfolioStore.getState();
      expect(state.holdings).toHaveLength(0);
      expect(state.freshMoney).toBe(0);
      expect(state.singleStockCap).toBe(10);
    });
  });

  describe('autoSplitFreshMoney', () => {
    it('returns error when no fresh money', () => {
      usePortfolioStore.setState({
        holdings: [{ id: '1', name: 'A', value: 100000, add: 0, target: 60, type: 'Stock' }],
        freshMoney: 0,
        singleStockCap: 10,
      });

      const result = usePortfolioStore.getState().autoSplitFreshMoney();
      expect(result.success).toBe(false);
      expect(result.message).toContain('fresh money amount');
    });

    it('returns error when no targets set', () => {
      usePortfolioStore.setState({
        holdings: [{ id: '1', name: 'A', value: 100000, add: 0, target: 0, type: 'Stock' }],
        freshMoney: 50000,
        singleStockCap: 10,
      });

      const result = usePortfolioStore.getState().autoSplitFreshMoney();
      expect(result.success).toBe(false);
      expect(result.message).toContain('target %');
    });

    it('splits money proportionally to shortfall', () => {
      usePortfolioStore.setState({
        holdings: [
          { id: '1', name: 'A', value: 50000, add: 0, target: 60, type: 'Stock' },
          { id: '2', name: 'B', value: 150000, add: 0, target: 40, type: 'MF' },
        ],
        freshMoney: 100000,
        singleStockCap: 10,
      });

      const result = usePortfolioStore.getState().autoSplitFreshMoney();
      expect(result.success).toBe(true);

      const holdings = usePortfolioStore.getState().holdings;
      expect(holdings[0].add).toBeGreaterThan(0);
      expect(holdings[1].add).toBe(0);
    });
  });

  describe('exportCSV', () => {
    it('generates and downloads CSV', () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

      usePortfolioStore.setState({
        holdings: [{ id: '1', name: 'Test', value: 100000, add: 50000, target: 60, type: 'Stock' }],
        freshMoney: 50000,
        singleStockCap: 10,
      });

      usePortfolioStore.getState().exportCSV();

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('importHoldings', () => {
    it('replaces existing holdings when mode is replace', () => {
      usePortfolioStore.setState({
        holdings: [{ id: '1', name: 'Old', value: 10000, add: 0, target: 10, type: 'Stock' }],
      });

      const newHoldings = [
        { id: '2', name: 'New 1', value: 20000, add: 0, target: 20, type: 'MF' as const },
        { id: '3', name: 'New 2', value: 30000, add: 0, target: 30, type: 'Stock' as const },
      ];

      usePortfolioStore.getState().importHoldings(newHoldings, 'replace');
      expect(usePortfolioStore.getState().holdings).toHaveLength(2);
      expect(usePortfolioStore.getState().holdings[0].name).toBe('New 1');
    });

    it('appends to existing holdings when mode is append', () => {
      usePortfolioStore.setState({
        holdings: [{ id: '1', name: 'Old', value: 10000, add: 0, target: 10, type: 'Stock' }],
      });

      const newHoldings = [
        { id: '2', name: 'New 1', value: 20000, add: 0, target: 20, type: 'MF' as const },
      ];

      usePortfolioStore.getState().importHoldings(newHoldings, 'append');
      expect(usePortfolioStore.getState().holdings).toHaveLength(2);
      expect(usePortfolioStore.getState().holdings[0].name).toBe('Old');
      expect(usePortfolioStore.getState().holdings[1].name).toBe('New 1');
    });
  });

  describe('persistence', () => {
    it('saves to localStorage on changes', () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem');

      usePortfolioStore.getState().addHolding();
      usePortfolioStore.getState().setFreshMoney(25000);

      expect(setItemSpy).toHaveBeenCalledWith(
        'alloc-v1',
        expect.stringContaining('holdings')
      );
    });
  });
});