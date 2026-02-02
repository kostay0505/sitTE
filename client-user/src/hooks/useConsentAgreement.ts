'use client';

import { useEffect, useState, useCallback } from 'react';

const CONSENT_STORAGE_KEY = 'tosAccepted:v1';

export function useConsentAgreement() {
  const [consentAccepted, setConsentAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const raw =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(CONSENT_STORAGE_KEY)
          : null;
      setConsentAccepted(raw === '1');
    } catch {
      setConsentAccepted(false);
    }
  }, []);

  const accept = useCallback(() => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, '1');
    } catch {}
    setConsentAccepted(true);
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {}
    setConsentAccepted(false);
  }, []);

  return {
    consentAccepted,
    accept,
    reset,
    isLoading: consentAccepted === null,
  };
}
