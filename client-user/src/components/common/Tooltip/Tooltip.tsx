'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { PropsWithChildren } from 'react';
import { cn } from '@/utils/cn';

type Props = PropsWithChildren<{
  content: string;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  asChild?: boolean;
}>;

export function AppTooltip({
  children,
  content,
  className,
  side = 'top',
  align = 'center',
  asChild = true,
}: Props) {
  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger
          asChild={asChild}
          onClick={(e) => {
            if ('ontouchstart' in window) {
              e.preventDefault();
            }
          }}
          onTouchStart={(e) => {
            e.preventDefault();
          }}
        >
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            align={align}
            onTouchStart={(e) => e.preventDefault()}
            className={cn(
              'z-[60] rounded-lg px-3 py-2 text-xs md:text-sm text-white bg-black/80 backdrop-blur',
              'shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
              'data-[side=top]:slide-in-from-bottom-1 data-[side=bottom]:slide-in-from-top-1',
              'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
              'touch-none select-none',
              className,
            )}
          >
            <span dangerouslySetInnerHTML={{ __html: content }} />
            <Tooltip.Arrow className='fill-black/80' />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
