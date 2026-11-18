import { useState, useEffect } from 'react';
import { num } from '../utils';

interface FormattedNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel?: string;
  id?: string;
  formatWithCommas?: boolean;
}

export function FormattedNumberInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  min = 0,
  max,
  step,
  ariaLabel,
  id,
  formatWithCommas = true,
}: FormattedNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localText, setLocalText] = useState(
    value === 0 ? '' : formatWithCommas ? value.toLocaleString('en-IN') : String(value)
  );

  useEffect(() => {
    if (!isFocused) {
      if (value === 0) {
        setLocalText('');
      } else {
        setLocalText(formatWithCommas ? value.toLocaleString('en-IN') : String(value));
      }
    }
  }, [value, isFocused, formatWithCommas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalText(raw);
    const parsed = num(raw);
    const bounded = max !== undefined ? Math.min(max, Math.max(min, parsed)) : Math.max(min, parsed);
    onChange(bounded);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setLocalText(value === 0 ? '' : String(value));
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = num(localText);
    const bounded = max !== undefined ? Math.min(max, Math.max(min, parsed)) : Math.max(min, parsed);
    onChange(bounded);
    if (bounded === 0) {
      setLocalText('');
    } else {
      setLocalText(formatWithCommas ? bounded.toLocaleString('en-IN') : String(bounded));
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      id={id}
      value={localText}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={className}
      step={step}
    />
  );
}
