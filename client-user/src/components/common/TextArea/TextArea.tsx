'use client';

import React, { useId, useMemo, useState } from 'react';
import { cn } from '@/utils/cn';
import { Element, scroller } from 'react-scroll';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  containerClassName?: string;

  withAutoScroll?: boolean;
  scrollName?: string;
  scrollOffset?: number;
  scrollDelayMs?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className,
  containerClassName,
  value,
  defaultValue,
  withAutoScroll,
  scrollName,
  scrollOffset = -96,
  scrollDelayMs = 150,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue =
    (typeof value === 'string' && value.length > 0) ||
    (typeof defaultValue === 'string' && defaultValue.length > 0);

  const autoId = useId();
  const anchorName = useMemo(
    () => scrollName ?? `textarea-${autoId}`,
    [scrollName, autoId],
  );

  return (
    <Element
      name={anchorName}
      className={cn(
        'relative w-full border border-[#4D4D4D] rounded-xl pt-4 bg-white',
        containerClassName,
      )}
    >
      <textarea
        {...props}
        value={value}
        className={cn(
          'block w-full text-sm text-gray-text rounded-xl px-2 pb-4 bg-white appearance-none transition focus:outline-none resize-none',
          error && 'border-red-500 focus:border-red-500',
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
          'absolute left-2 right-2 top-4 text-[#4D4D4D] text-sm pointer-events-none transition-all duration-200 leading-[100%]',
          (focused || hasValue) && '!top-2 text-[9px] line-clamp-1',
          error && 'text-red-500',
        )}
      >
        {error ? error : label}
      </label>
    </Element>
  );
};
