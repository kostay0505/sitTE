'use client';

import { Input } from '@/components/common/Input/Input';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Поиск',
  disabled = false,
  className = '',
  onSearch,
}: SearchInputProps) => {
  const canSearch = !!value.trim() && !disabled;
  const doSearch = () => {
    const q = value.trim();
    if (!q) return;
    onSearch?.(q);
  };

  return (
    <Input
      label={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') doSearch();
      }}
      icon={Search}
      onIconClick={doSearch}
      iconButtonDisabled={!canSearch}
      iconAriaLabel='Найти'
      disabled={disabled}
      containerClassName={className}
    />
  );
};
