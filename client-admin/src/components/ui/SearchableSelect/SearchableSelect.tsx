import { useState, useEffect } from 'react';
import { SPACING } from '@/constants/ui';

interface SearchableSelectOption {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    name?: string;
    value: string;
    onChange: (value: string) => void;
    options: SearchableSelectOption[];
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
}

export function SearchableSelect({
    name,
    value,
    onChange,
    options = [],
    placeholder,
    required,
    error,
    disabled = false,
    style
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState<SearchableSelectOption | null>(null);

    useEffect(() => {
        const option = options.find(opt => opt.value === value);
        setSelectedOption(option || null);
    }, [value, options]);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: SearchableSelectOption) => {
        setSelectedOption(option);
        onChange(option.value);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setSearchTerm(inputValue);

        if (!isOpen) {
            setIsOpen(true);
        }

        if (inputValue === '') {
            onChange('');
            setSelectedOption(null);
        }
    };

    const handleInputFocus = () => {
        if (!disabled) {
            setIsOpen(true);
            setSearchTerm('');
        }
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setIsOpen(false);
            setSearchTerm('');
        }, 200);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <input
                type="text"
                name={name}
                value={isOpen ? searchTerm : (selectedOption?.label || '')}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || 'Выберите значение'}
                required={required}
                disabled={disabled}
                style={{
                    width: '100%',
                    padding: `${SPACING.MD} ${SPACING.LG}`,
                    border: `1px solid ${error ? '#991b1b' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: disabled ? '#f3f4f6' : 'white',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    ...style
                }}
            />

            {isOpen && !disabled && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        zIndex: 1000,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        marginTop: '4px',
                    }}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option)}
                                style={{
                                    padding: `${SPACING.SM} ${SPACING.LG}`,
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    borderBottom: '1px solid #f3f4f6',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div
                            style={{
                                padding: `${SPACING.SM} ${SPACING.LG}`,
                                fontSize: '14px',
                                color: '#6b7280',
                                textAlign: 'center',
                            }}
                        >
                            Ничего не найдено
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
