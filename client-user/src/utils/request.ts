export function pickErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as any;
  return anyErr?.response?.data?.message || anyErr?.message || fallback;
}

// локально чистим null/undefined из query
export function cleanParams<T extends Record<string, any>>(
  params?: T,
): Partial<T> | undefined {
  if (!params) return undefined;
  const entries = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined,
  );
  return Object.fromEntries(entries) as Partial<T>;
}
