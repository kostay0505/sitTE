'use client';

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/utils/cn';
import { X, ChevronDown, Check } from 'lucide-react';
import { Element, scroller } from 'react-scroll';

export interface ComboOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface ComboSelectProps {
  label?: string;
  value?: string | number; // по умолчанию пусто
  options: ComboOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  noOptionsText?: string;
  loading?: boolean;

  withAutoScroll?: boolean;
  scrollName?: string;
  scrollOffset?: number;
  scrollDelayMs?: number;
}

export const ComboSelect: React.FC<ComboSelectProps> = ({
  label,
  value = '', // дефолт — пусто => виден placeholder
  options,
  onChange,
  placeholder = 'Выбрать...',
  containerClassName,
  className,
  disabled,
  error,
  noOptionsText = 'Нет вариантов',
  loading,

  withAutoScroll,
  scrollName,
  scrollOffset = -96,
  scrollDelayMs = 150,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(''); // всегда показываем query
  const [activeIdx, setActiveIdx] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const baseOptions = useMemo<ComboOption[]>(() => options, [options]);

  const selected = useMemo(
    () => baseOptions.find(o => String(o.value) === String(value)),
    [baseOptions, value],
  );

  // синк query с выбранным (убирает "скачок")
  useEffect(() => {
    setQuery(selected?.label ?? '');
  }, [selected?.label]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseOptions;
    return baseOptions.filter(o => o.label.toLowerCase().includes(q));
  }, [baseOptions, query]);

  // закрытие поповера с опциональным ресетом query к выбранному
  const closePopover = useCallback(
    (resetQuery = true) => {
      setOpen(false);
      if (resetQuery) setQuery(selected?.label ?? ''); // если не выбрано — будет '', покажется placeholder
      setActiveIdx(-1);
    },
    [selected?.label],
  );

  // клик вне — закрыть и сбросить query к выбранному
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      if (wrapperRef.current?.contains(e.target as Node)) return;
      closePopover(true);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, selected?.label, closePopover]); // если выбранное сменилось — замыкание актуально

  // прокрутка к активному
  useEffect(() => {
    if (activeIdx < 0) return;
    const el = listRef.current?.querySelector<HTMLDivElement>(
      `[data-idx="${activeIdx}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const inputClass =
    'w-full h-full pl-2 text-[#2A2A2A] outline-none text-sm md:text-base truncate placeholder-[#4D4D4D]';

  const hasValue = value !== '' && value !== undefined && value !== null;

  // blur: если фокус ушёл за пределы компонента — закрыть и сбросить query
  const handleBlur = () => {
    // ждём, пока browser пересчитает activeElement
    setTimeout(() => {
      const ae = document.activeElement;
      if (!wrapperRef.current?.contains(ae)) {
        closePopover(true);
      }
    }, 0);
  };

  const autoId = useId();
  const anchorName = useMemo(
    () => scrollName ?? `comboselect-${autoId}`,
    [scrollName, autoId],
  );

  return (
    <div
      ref={wrapperRef}
      className={cn('relative h-[40px]', containerClassName)}
    >
      {label && (
        <label className='block mb-1 text-[12px] md:text-sm text-[#2A2A2A]'>
          {label}
        </label>
      )}
      <Element name={anchorName} />
      <div className='relative h-full flex rounded-xl border border-[#4D4D4D] items-center bg-white pr-1'>
        <input
          ref={inputRef}
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            if (withAutoScroll && anchorName)
              scroller.scrollTo(anchorName, {
                duration: 500,
                smooth: true,
                offset: scrollOffset,
                delay: scrollDelayMs,
              });
          }}
          onClick={() => setOpen(true)}
          onChange={e => {
            setOpen(true);
            setQuery(e.target.value);
            setActiveIdx(-1);
          }}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActiveIdx(prev => Math.min(prev + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIdx(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const item = activeIdx >= 0 ? filtered[activeIdx] : filtered[0];
              if (item && !item.disabled) {
                onChange(String(item.value));
                setQuery(item.label);
                closePopover(false); // уже синкнули query — можно не ресетить
              }
            } else if (e.key === 'Escape') {
              e.preventDefault();
              closePopover(true);
            } else if (e.key === 'Tab') {
              // при табе наружу — закроем и вернём видимое значение к выбранному
              // (если пользователь ввёл текст, которого нет в опциях)
              // native blur тоже это подхватит, но на всякий запас:
              closePopover(true);
            }
          }}
          onBlur={handleBlur}
          className={cn(
            inputClass,
            error && '!border-red-500 focus:!border-red-500',
            disabled && 'opacity-60 pointer-events-none',
            className,
          )}
        />

        {/* Иконки справа */}
        {hasValue ? (
          <button
            type='button'
            aria-label='Очистить'
            onMouseDown={e => e.preventDefault()}
            onClick={() => {
              onChange(''); // сбрасываем выбранное
              setQuery(''); // показываем placeholder
              closePopover(true); // уже выставили нужный query
              inputRef.current?.focus();
            }}
            className='text-[#2A2A2A] bg-transparent'
          >
            <X size={18} strokeWidth={2} />
          </button>
        ) : (
          <button
            type='button'
            className='text-[#2A2A2A]'
            onMouseDown={e => e.preventDefault()}
            onClick={() => {
              setOpen(prev => !prev);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            disabled={disabled}
          >
            <ChevronDown
              size={18}
              strokeWidth={2}
              className={cn(open && 'rotate-180 transition-transform')}
            />
          </button>
        )}
      </div>

      {/* Поповер со списком */}
      {open && (
        <div
          ref={listRef}
          className='absolute z-50 mt-1 w-full rounded-xl border border-[#4D4D4D] bg-white text-[#2A2A2A] shadow-lg max-h-72 overflow-auto scrollbar-hide'
          role='listbox'
          onKeyDown={e => {
            if (e.key === 'Escape') {
              closePopover(true);
            }
          }}
        >
          {loading ? (
            <div className='px-2 py-2 text-[10px] md:text-sm opacity-70'>
              Загрузка…
            </div>
          ) : filtered.length === 0 ? (
            <div className='px-2 py-2 text-[10px] md:text-sm opacity-70'>
              {noOptionsText}
            </div>
          ) : (
            filtered.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              const isActive = idx === activeIdx;
              return (
                <div
                  key={`${opt.value}`}
                  data-idx={idx}
                  role='option'
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(String(opt.value));
                    setQuery(opt.label);
                    closePopover(false);
                  }}
                  className={cn(
                    'p-2 text-sm cursor-pointer select-none flex items-center justify-between',
                    opt.disabled && 'opacity-50 cursor-not-allowed',
                    isActive && 'bg-[#F3F4F6]',
                    isSelected && 'font-medium',
                  )}
                >
                  <span className='truncate text-[10px] md:text-sm'>
                    {opt.label}
                  </span>
                  {isSelected && <Check size={16} strokeWidth={2} />}
                </div>
              );
            })
          )}
        </div>
      )}

      {error && (
        <div className='mt-1 text-[10px] md:text-sm text-red-600'>{error}</div>
      )}
    </div>
  );
};
