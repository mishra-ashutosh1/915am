import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HoldingsTable } from './HoldingsTable';
import type { HoldingWithMetrics } from './types';

describe('HoldingsTable component', () => {
  it('renders empty state when holdings is empty', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(<HoldingsTable holdings={[]} onUpdate={onUpdate} onRemove={onRemove} />);

    expect(screen.getAllByText(/no holdings yet/i).length).toBeGreaterThan(0);
  });

  it('renders holdings rows and mobile cards', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const holdings: HoldingWithMetrics[] = [
      {
        id: 'h1',
        name: 'SBI Bluechip Fund',
        value: 150000,
        add: 50000,
        target: 20,
        type: 'MF',
        nowPct: 30,
        afterPct: 35,
        need: 'on target',
        needClass: 'ok',
        overLimit: false,
        color: '#22c55e',
      },
    ];

    render(<HoldingsTable holdings={holdings} onUpdate={onUpdate} onRemove={onRemove} />);

    // Found in both desktop table row and mobile card
    expect(screen.getAllByDisplayValue('SBI Bluechip Fund')).toHaveLength(2);
    expect(screen.getAllByDisplayValue('MF')).toHaveLength(2);
    expect(screen.getAllByDisplayValue('1,50,000')).toHaveLength(2);
  });
});
