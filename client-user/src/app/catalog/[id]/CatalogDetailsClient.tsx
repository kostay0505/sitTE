'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Page } from '@/components/Page';
import { ProductImageGallery } from '@/components/Product/ProductImageGallery';
import { ProductHeader } from '@/components/Product/ProductHeader';
import { ProductDescription } from '@/components/Product/ProductDescription';
import { useProduct } from '@/features/products/hooks';
import { markProductViewed } from '@/api/products/methods';
import type { Product } from '@/api/products/types';
import { toImageSrc } from '@/utils/toImageSrc';
import { ShareModal } from '@/components/Product/ShareModal';
import { getOrCreateChat } from '@/api/chat/methods';
import { useAuthStore } from '@/stores/authStore';
import { getTokens } from '@/api/auth/tokenStorage';
import { extractTgIdFromToken } from '@/utils/tokenUtils';

function mapMediaFiles(
  p?: Product,
): { url: string; type: 'image' | 'video' }[] {
  if (!p) return [];

  const VIDEO_EXT_RE = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i;
  const isVideoUrl = (url: string) => VIDEO_EXT_RE.test(url.split('?')[0]);

  const mediaFiles = [p.preview, ...(p.files || [])]
    .filter(Boolean)
    .map(url => ({
      url: toImageSrc(url),
      type: isVideoUrl(url) ? ('video' as const) : ('image' as const),
    }));
  return mediaFiles;
}

export function CatalogDetailsClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState(false);
  const { data: product, status } = useProduct(id);
  const isLoading = status === 'pending';
  const isAuthorized = useAuthStore(s => s.isAuthorized);

  // Get current user tgId from stored JWT
  const currentUserTgId = (() => {
    if (typeof window === 'undefined') return '';
    const tokens = getTokens();
    if (tokens?.accessToken) {
      return extractTgIdFromToken(tokens.accessToken) ?? '';
    }
    return '';
  })();

  // product.user.tgId is the seller's tgId
  const sellerTgId = product?.user?.tgId ?? null;
  const isSeller = !!sellerTgId && !!currentUserTgId && sellerTgId === currentUserTgId;
  const showChatButton = isAuthorized && !isSeller && !!product?.id;

  useEffect(() => {
    if (product?.id) {
      markProductViewed({ id: product.id }).catch(() => {});
    }
  }, [product?.id]);

  const handleOpenChat = async () => {
    if (!product?.id) return;
    try {
      setChatLoading(true);
      const chat = await getOrCreateChat(product.id);
      router.push('/chats/' + chat.id);
    } catch {
      // ignore error silently
    } finally {
      setChatLoading(false);
    }
  };

  if (!isLoading && !product) {
    return (
      <div className='p-2 pt-4 text-center text-black'>Продукт не найден</div>
    );
  }

  return (
    <Page back={true}>
      <Layout className='p-2 pt-4'>
        {/* Mobile version */}
        <div className='flex flex-col gap-5 md:hidden mb-5'>
          <ProductHeader
            product={product}
            isLoading={isLoading}
            isOpen={isOpen}
            setIsOpen={() => {
              setIsOpen(true);
            }}
          />
          <ProductImageGallery
            mediaFiles={mapMediaFiles(product)}
            productId={product?.id ?? ''}
            isLoading={isLoading}
            isFavorite={product?.isFavorite}
          />
          <ProductDescription
            description={product?.description ?? ''}
            isLoading={isLoading}
          />
          {showChatButton && (
            <button
              onClick={handleOpenChat}
              disabled={chatLoading}
              className='w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-60'
            >
              {chatLoading ? (
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
              ) : (
                <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                </svg>
              )}
              Написать продавцу
            </button>
          )}
        </div>

        {/* Desktop version */}
        <div className='hidden w-full md:flex flex-row gap-5 mb-5'>
          <ProductImageGallery
            mediaFiles={mapMediaFiles(product)}
            productId={product?.id ?? ''}
            isLoading={isLoading}
            className='max-w-2/5 w-full'
            isFavorite={product?.isFavorite}
          />
          <div className='flex-1 flex flex-col gap-5 w-full'>
            <ProductHeader
              product={product}
              isLoading={isLoading}
              isOpen={isOpen}
              setIsOpen={() => {
                setIsOpen(true);
              }}
            />
            <ProductDescription
              description={product?.description ?? ''}
              isLoading={isLoading}
            />
            {showChatButton && (
              <button
                onClick={handleOpenChat}
                disabled={chatLoading}
                className='flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-60 self-start'
              >
                {chatLoading ? (
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                ) : (
                  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                  </svg>
                )}
                Написать продавцу
              </button>
            )}
          </div>
        </div>
      </Layout>
      <ShareModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        url={`${product?.url}`}
      ></ShareModal>
    </Page>
  );
}
