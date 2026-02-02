'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export const Switch = ({
  checked,
  onCheckedChange,
  className,
  disabled,
}: SwitchProps) => {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-70',
        checked ? 'bg-black' : 'bg-gray-300',
        className,
      )}
      disabled={disabled}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          'inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow',
          checked ? 'translate-x-[18px]' : 'translate-x-[4px]',
        )}
      />
    </button>
  );
};
