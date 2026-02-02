'use client';
import React, { useId, useMemo, useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { Element, scroller } from 'react-scroll';
import { Eye, EyeClosed } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  lableFocusedClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onIconClick?: () => void;
  iconButtonDisabled?: boolean;
  iconAriaLabel?: string;

  withAutoScroll?: boolean;
  scrollName?: string;
  scrollOffset?: number;
  scrollDelayMs?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  containerClassName,
  labelClassName,
  lableFocusedClassName,
  value,
  icon,
  onIconClick,
  iconButtonDisabled,
  iconAriaLabel = 'action',
  withAutoScroll,
  scrollName,
  scrollOffset = -96,
  scrollDelayMs = 150,
  onFocus,
  onBlur,
  type,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue =
    value !== undefined && value !== null && `${value}`.length > 0;

  const isPassword = type === 'password';
  const Icon = icon;

  const autoId = useId();
  const anchorName = useMemo(
    () => scrollName ?? `input-${autoId}`,
    [scrollName, autoId],
  );

  useEffect(() => {
    if (!isPassword) return;

    const handleMouseUp = () => {
      setShowPassword(false);
    };

    const handleTouchEnd = () => {
      setShowPassword(false);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPassword]);

  return (
    <Element
      name={anchorName}
      className={cn(
        'flex items-center',
        'relative w-full h-10 border border-[#4D4D4D] rounded-xl text-sm text-[#4D4D4D] bg-white',
        error && 'border-red-500 focus:border-red-500',
        (icon || isPassword) && 'pr-2',
        containerClassName,
      )}
    >
      <input
        {...props}
        type={isPassword && showPassword ? 'text' : type}
        value={value}
        className={cn(
          'block w-full px-2 appearance-none transition focus:outline-none',
          className,
        )}
        onFocus={e => {
          setFocused(true);
          onFocus?.(e);
          if (withAutoScroll && anchorName)
            scroller.scrollTo(anchorName, {
              duration: 500,
              smooth: true,
              offset: scrollOffset,
              delay: scrollDelayMs,
            });
        }}
        onBlur={e => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      <label
        className={cn(
          'absolute left-2 top-1/2 transform -translate-y-1/2 text-sm text-[#4D4D4D] pointer-events-none transition-all duration-200 leading-[100%] line-clamp-1',
          labelClassName,
          (focused || hasValue) &&
            !error &&
            `!top-[0.5px] !translate-y-0 text-[9px] ${lableFocusedClassName}`,
          (focused || hasValue) &&
            error &&
            `!top-[1.5px] !translate-y-0 text-[9px] ${lableFocusedClassName}`,
          error && 'text-red-500',
        )}
      >
        {error ? error : label}
      </label>
      {isPassword && (
        <button
          type='button'
          aria-label='Показать пароль'
          onMouseDown={e => {
            e.preventDefault();
            setShowPassword(true);
          }}
          onTouchStart={e => {
            e.preventDefault();
            setShowPassword(true);
          }}
          className='flex items-center justify-center'
        >
          {showPassword ? (
            <Eye className='w-6 h-6 text-[#4D4D4D]' />
          ) : (
            <EyeClosed className='w-6 h-6 text-[#4D4D4D]' />
          )}
        </button>
      )}
      {Icon &&
        !isPassword &&
        (onIconClick ? (
          <button
            type='button'
            aria-label={iconAriaLabel}
            disabled={iconButtonDisabled}
            onMouseDown={e => e.preventDefault()}
            onClick={onIconClick}
            className={cn(
              iconButtonDisabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <Icon className='w-6 h-6' />
          </button>
        ) : (
          <Icon className='w-6 h-6' />
        ))}
    </Element>
  );
};
