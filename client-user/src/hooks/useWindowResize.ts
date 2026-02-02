'use client';
import { useEffect, useLayoutEffect, useState } from 'react';

type Size = [number, number];

export const useWindowResize = () => {
  const getSize = (): Size =>
    typeof window === 'undefined'
      ? [0, 0] // на сервере
      : [window.innerWidth, window.innerHeight];

  const [size, setSize] = useState<Size>(getSize);

  // useLayoutEffect, чтобы применить ещё до отрисовки
  const useIsoEffect =
    typeof window === 'undefined' ? useEffect : useLayoutEffect;

  useIsoEffect(() => {
    const update = () => setSize(getSize());
    update(); // <-- сразу выставляем актуальные значения
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return { width: size[0], height: size[1] };
};
