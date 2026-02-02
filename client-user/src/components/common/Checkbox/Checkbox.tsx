'use client';

import { useId, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CheckboxProps {
  label?: React.ReactNode;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({
  label,
  checked: initialChecked,
  onChange,
  className,
}: CheckboxProps) {
  const [checked, setChecked] = useState<boolean>(!!initialChecked);

  const toggle = () => {
    const newValue = !checked;
    setChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 cursor-pointer select-none',
        className,
      )}
      onClick={toggle}
    >
      <span
        className={cn(
          'flex items-center justify-center min-h-5 min-w-5 rounded-md transition-colors',
          checked ? 'bg-black' : 'bg-white border border-gray-300',
        )}
      >
        {checked && <Check className='h-3.5 w-3.5 text-white' />}
      </span>

      {label && (
        <span className='text-[13px] md:text-sm text-[#334155]'>{label}</span>
      )}
    </div>
  );
}
