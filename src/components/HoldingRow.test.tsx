import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoldingRow } from './HoldingRow';
import type { HoldingWithMetrics } from './types';

describe('HoldingRow component', () => {
  const mockHolding: HoldingWithMetrics = {
    id: 'h-1',
    name: 'Reliance Industries',
    value: 100000,
    add: 25000,
    target: 15,
    type: 'Stock',
    nowPct: 20,
    afterPct: 25,
    need: '+₹10,000',
    needClass: 'warn',
    overLimit: false,
    color: '#3b82f6',
  };

  it('renders holding inputs and formatted values', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <table>
        <tbody>
          <HoldingRow holding={mockHolding} onUpdate={onUpdate} onRemove={onRemove} />
        </tbody>
      </table>
    );

    expect(screen.getByDisplayValue('Reliance Industries')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Stock')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1,00,000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25,000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    expect(screen.getByText('20.0%')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.getByText('+₹10,000')).toBeInTheDocument();
  });

  it('calls onUpdate when user edits name, value, add, target, and type', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <table>
        <tbody>
          <HoldingRow holding={mockHolding} onUpdate={onUpdate} onRemove={onRemove} />
        </tbody>
      </table>
    );

    const nameInput = screen.getByDisplayValue('Reliance Industries');
    await user.clear(nameInput);
    await user.type(nameInput, 'TCS');
    expect(onUpdate).toHaveBeenCalledWith('h-1', 'name', expect.stringContaining('T'));

    const typeSelect = screen.getByDisplayValue('Stock');
    await user.selectOptions(typeSelect, 'MF');
    expect(onUpdate).toHaveBeenCalledWith('h-1', 'type', 'MF');

    const removeBtn = screen.getByRole('button', { name: /remove holding/i });
    await user.click(removeBtn);
    expect(onRemove).toHaveBeenCalledWith('h-1');
  });

  it('displays over limit warning badge when overLimit is true', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    const overLimitHolding: HoldingWithMetrics = {
      ...mockHolding,
      overLimit: true,
      afterPct: 35,
    };

    render(
      <table>
        <tbody>
          <HoldingRow holding={overLimitHolding} onUpdate={onUpdate} onRemove={onRemove} />
        </tbody>
      </table>
    );

    expect(screen.getByText(/over limit/i)).toBeInTheDocument();
  });
});
