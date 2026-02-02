'use client';

import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import { ProductCard } from '@/components/Catalog/ProductCard';
import { ROUTES } from '@/config/routes';
import { useDeleteProduct, useMyProducts } from '@/features/products/hooks';
import { toast } from 'sonner';
import type { ProductBasic } from '@/api/products/types';
import { formatPrice } from '@/utils/currency';

export default function MyAdsPage() {
  const { data, status } = useMyProducts();
  const del = useDeleteProduct();

  const isLoading = status === 'pending';
  const items = data ?? [];

  const handleDelete = (id: string) => {
    if (!id) return;
    if (confirm('Удалить объявление?')) {
      del.mutate(id, {
        onSuccess: () => toast.success('Объявление удалено'),
        onError: (e: any) =>
          toast.error(e?.message ?? 'Не удалось удалить объявление'),
      });
    }
  };

  const handlePosting = (product: ProductBasic) => {
    if (!product) return;

    const message = `🏷️ ${product.name}\n\n${product.description}\n\n💰 ${formatPrice(product.priceCash, product.currency)}\n\n🔗 ${product.url}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(product.url || '')}&text=${encodeURIComponent(message)}`;

    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <ProtectedRoute>
      <Page back={true}>
        <Layout className='p-2 pt-4'>
          <h2 className='text-center text-lg text-black font-medium mb-4'>
            Мои объявления
          </h2>

          {isLoading && (
            <div className='grid grid-cols-3 md:grid-cols-4 gap-4'>
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCard key={i} isLoading />
              ))}
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className='p-2 pt-4 text-center text-black'>
              Объявлений пока нет
            </div>
          )}

          <div className='grid grid-cols-3 md:grid-cols-4 gap-4'>
            {items.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                hideFavorite
                showDelete
                onDelete={handleDelete}
                showPosting
                onPosting={handlePosting}
                href={`${ROUTES.EDIT_ADVERTISEMENT}/${product.id}`}
                showStatus
              />
            ))}
          </div>
        </Layout>
      </Page>
    </ProtectedRoute>
  );
}
