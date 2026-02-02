'use client';

import { TgIcon2 } from './common/SvgIcon';
import { cn } from '@/utils/cn';

interface ContactWithTgProps {
  className?: string;
  href: string;
  disabled?: boolean;
}

export const ContactWithTg = ({
  className = '',
  href,
  disabled,
}: ContactWithTgProps) => {
  return (
    <a
      href={href}
      target='_blank'
      className={cn(
        'flex items-center gap-2 text-black text-sm md:text-base hover:opacity-70 transition',
        disabled && 'pointer-events-none',
        className,
      )}
    >
      Связаться <TgIcon2 className='w-6 h-6' />
    </a>
  );
};
