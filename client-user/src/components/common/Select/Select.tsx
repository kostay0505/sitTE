import { cn } from '@/utils/cn';
import React, { useId, useMemo } from 'react';
import { Element, scroller } from 'react-scroll';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  label?: string;
  value: string | number;
  options: Option[];
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  selectStyle?: React.CSSProperties;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  containerClassName?: string;
  className?: string;
  error?: string; // ✅ добавлено

  withAutoScroll?: boolean;
  scrollName?: string;
  scrollOffset?: number;
  scrollDelayMs?: number;
}

const baseSelectStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  padding: '0 12px',
  borderRadius: '12px',
  border: '1px solid #4D4D4D',
  backgroundColor: '#fff',
  color: '#2A2A2A',
  boxSizing: 'border-box',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' strokeLinecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,

  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '16px',
  paddingRight: '40px',
  outline: 'none',
};

const baseLabelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '4px',
  fontSize: '14px',
  color: '#2A2A2A',
};

export const Select: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  onChange,
  style,
  labelStyle,
  selectStyle,
  id,
  disabled = false,
  placeholder,
  containerClassName,
  className,
  error,
  withAutoScroll,
  scrollName,
  scrollOffset = -96,
  scrollDelayMs = 150,
}) => {
  const selectId =
    id || `custom-select-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  const hasError = Boolean(error);

  const autoId = useId();
  const anchorName = useMemo(
    () => scrollName ?? `select-${autoId}`,
    [scrollName, autoId],
  );

  return (
    <Element name={anchorName} style={style} className={containerClassName}>
      {(label || error) && (
        <label
          htmlFor={selectId}
          style={{ ...baseLabelStyle, ...labelStyle }}
          className={cn(hasError && '!border-red-500 focus:!border-red-500')}
        >
          {error || label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...baseSelectStyle, ...selectStyle }}
        disabled={disabled}
        className={cn(
          className,
          hasError && '!border-red-500 focus:!border-red-500',
        )}
        onFocus={() => {
          if (withAutoScroll && anchorName)
            scroller.scrollTo(anchorName, {
              duration: 500,
              smooth: true,
              offset: scrollOffset,
            });
        }}
      >
        {placeholder && (
          <option value='' disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value} disabled={opt?.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </Element>
  );
};
