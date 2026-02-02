'use client';

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useToggleFavorite } from '@/features/products/hooks';
import { useAuthStore } from '@/stores/authStore';

type Props = {
  productId: string;
  isFavorite: boolean;
  className?: string;
  size?: number;
};

export function FavoriteButton({
  productId,
  isFavorite,
  className,
  size = 20,
}: Props) {
  const mutation = useToggleFavorite(productId);
  const isAuthorized = useAuthStore(s => s.isAuthorized);
  const setAuthMode = useAuthStore(s => s.setAuthMode);

  const handleClick: React.MouseEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthorized) {
      setAuthMode('login');
      return;
    }

    mutation.mutate(!isFavorite);
  };

  return (
    <motion.button
      whileTap={{ scale: 1.2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={handleClick}
      className={cn('cursor-pointer', className)}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      aria-pressed={isFavorite}
      title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
      disabled={mutation.isPending}
    >
      <Heart
        className={cn(
          'transition',
          isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400',
        )}
        style={{ width: size, height: size }}
      />
    </motion.button>
  );
}
