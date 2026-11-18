import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders theme buttons and allows switching theme', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const lightBtn = screen.getByLabelText(/light theme/i);
    const darkBtn = screen.getByLabelText(/dark theme/i);
    const systemBtn = screen.getByLabelText(/system theme/i);

    expect(lightBtn).toBeInTheDocument();
    expect(darkBtn).toBeInTheDocument();
    expect(systemBtn).toBeInTheDocument();

    // Click dark
    await user.click(darkBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

    // Click light
    await user.click(lightBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });
});
