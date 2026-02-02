import type { CurrencyList } from '@/api/products/types';

/** Маппинги код ⇄ символ */
const SYMBOL_BY_CURRENCY: Record<CurrencyList, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
};

const CURRENCY_BY_SYMBOL: Record<string, CurrencyList> = {
  '₽': 'RUB',
  $: 'USD',
  '€': 'EUR',
};

/** Нормализуем вход в код валюты (если пришёл символ или "rub") */
export function normalizeCurrencyCode(val?: string): CurrencyList | null {
  if (!val) return null;
  // символ → код
  if (val in CURRENCY_BY_SYMBOL) return CURRENCY_BY_SYMBOL[val];
  // строка → нормализованный код
  const upper = val.toUpperCase() as CurrencyList;
  return upper === 'RUB' || upper === 'USD' || upper === 'EUR' ? upper : null;
}

/** Код валюты → символ (безопасно к любому string) */
export function getCurrencySymbol(currency?: string): string {
  const code = normalizeCurrencyCode(currency || '');
  return code ? SYMBOL_BY_CURRENCY[code] : '';
}

/** Число/строка → красиво отформатированная строка с разделителями */
export function formatCurrencyNumber(
  num: number | string | undefined,
  fix = 0,
  separator = ' ',
): string {
  if (num === undefined || num === null) return '';
  const parsedNum = Number(num);
  if (Number.isNaN(parsedNum)) return '';

  const [integerPart, decimalPart] = parsedNum.toFixed(fix).split('.');
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    separator,
  );

  return fix > 0 && decimalPart !== undefined
    ? `${formattedIntegerPart}.${decimalPart}`
    : formattedIntegerPart;
}

/** Быстрый хелпер: число + символ валюты */
export function formatPrice(
  value: number | string | undefined,
  currency?: string,
  opts?: {
    decimals?: number; // по умолчанию 0
    separator?: string; // по умолчанию ' '
    position?: 'before' | 'after'; // по умолчанию 'after' -> "10 000 ₽"
  },
): string {
  const decimals = opts?.decimals ?? 0;
  const separator = opts?.separator ?? ' ';
  const position = opts?.position ?? 'after';

  const n = formatCurrencyNumber(value, decimals, separator);
  const sym = getCurrencySymbol(currency);

  if (!n) return ''; // нет числа — пусто
  if (!sym) return n; // нет символа — только число

  return position === 'before' ? `${sym}${n}` : `${n} ${sym}`;
}

/** Обратное преобразование для запросов на бэк: символ/код → код */
export function toServerCurrency(val?: string): CurrencyList | null {
  return normalizeCurrencyCode(val);
}

// ⚠️ временный alias, чтобы не ломать существующие импорты с опечаткой
export const formatCurrenyNumber = formatCurrencyNumber;
