import React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  animate?: boolean;
  withImageIcon?: boolean;
  imageIconClassName?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = 'rounded-md',
  animate = true,
  withImageIcon = false,
  imageIconClassName = '',
  style,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-gray-300',
        animate && 'animate-pulse',
        rounded,
        'relative',
        className,
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    >
      {withImageIcon && (
        <span className='absolute inset-0 flex items-center justify-center'>
          <svg
            className={cn(
              'w-10 h-10 text-gray-200 dark:text-gray-600',
              imageIconClassName,
            )}
            aria-hidden='true'
            xmlns='http://www.w3.org/2000/svg'
            fill='currentColor'
            viewBox='0 0 20 18'
          >
            <path d='M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z' />
          </svg>
        </span>
      )}
    </div>
  );
};
