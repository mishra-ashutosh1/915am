import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportModal } from './ImportModal';

describe('ImportModal component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ImportModal isOpen={false} onClose={vi.fn()} onImport={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('allows pasting CSV data and importing holdings', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onImport = vi.fn();

    render(<ImportModal isOpen={true} onClose={onClose} onImport={onImport} />);

    expect(screen.getByText(/import portfolio holdings/i)).toBeInTheDocument();

    // Switch to paste tab
    const pasteTab = screen.getByRole('button', { name: /paste csv/i });
    await user.click(pasteTab);

    // Paste data
    const textarea = screen.getByRole('textbox');
    const sampleCsv = `Name,Type,Current Value,Target %
HDFC Bank,Stock,150000,10
SBI Equity Hybrid,MF,250000,20`;

    await user.type(textarea, sampleCsv);

    // Verify preview appears
    expect(screen.getByText(/found/i)).toBeInTheDocument();
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    expect(screen.getByText('SBI Equity Hybrid')).toBeInTheDocument();

    // Click Import
    const importBtn = screen.getByRole('button', { name: /import 2 holdings/i });
    await user.click(importBtn);

    expect(onImport).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'HDFC Bank', value: 150000, type: 'Stock' }),
        expect.objectContaining({ name: 'SBI Equity Hybrid', value: 250000, type: 'MF' }),
      ]),
      'replace',
      expect.anything()
    );
    expect(onClose).toHaveBeenCalled();
  });
});
