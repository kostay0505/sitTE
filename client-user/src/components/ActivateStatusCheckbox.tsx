'use client';

import { Loader2 } from 'lucide-react';

type Props = {
  checked?: boolean;
  loading?: boolean;
  onChange: () => void;
  label?: string;
};

export function ActivateStatusCheckbox({
  checked,
  loading,
  onChange,
  label,
}: Props) {
  return (
    <label className='inline-flex items-center gap-2 cursor-pointer'>
      <input
        type='checkbox'
        className='h-4 w-4'
        checked={!!checked}
        disabled={loading}
        onChange={onChange}
      />
      {loading && <Loader2 className='h-4 w-4 animate-spin' />}
      <span>{label ?? (checked ? 'В наличии' : 'Не в наличии')}</span>
    </label>
  );
}
