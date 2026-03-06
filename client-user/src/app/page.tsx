'use client';

import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Page } from '@/components/Page';
import { HomeBanner } from '@/components/home/HomeBanner';
import { HomeProductCarousel } from '@/components/home/HomeProductCarousel';
import { HomeBrandCarousel } from '@/components/home/HomeBrandCarousel';
import { CategoryNav } from '@/components/home/CategoryNav';
import { getHomeCategories, getTouringExpertProducts, getBestsellers } from '@/api/home/methods';
import { getSiteContentAll } from '@/api/site-content/methods';
import type { BannerContent } from '@/api/site-content/types';

function parseBanner(raw: any): BannerContent | null {
  if (!raw) return null;
  if (typeof raw === 'object' && Array.isArray(raw.slides)) return raw as BannerContent;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.slides)) return parsed;
    } catch {}
  }
  return null;
}

function FullWidthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
      {children}
    </div>
  );
}

export default function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ['homeCategories'],
    queryFn: getHomeCategories,
    staleTime: 10 * 60 * 1000,
  });

  const { data: siteContent = {} } = useQuery({
    queryKey: ['siteContentAll'],
    queryFn: getSiteContentAll,
    staleTime: 5 * 60 * 1000,
  });

  const banner1 = parseBanner(siteContent.banner1);
  const banner2 = parseBanner(siteContent.banner2);
  const banner3 = parseBanner(siteContent.banner3);

  return (
    <Page back={false}>
      <Layout className='flex flex-col gap-8 pb-8'>
        {/* Category nav (desktop only, right under header) */}
        <FullWidthWrapper>
          <CategoryNav />
        </FullWidthWrapper>

        {/* Banner 1 */}
        {banner1 && (
          <FullWidthWrapper>
            <HomeBanner content={banner1} />
          </FullWidthWrapper>
        )}

        {/* Touring Expert carousel */}
        <div className='px-2 md:px-6'>
          <HomeProductCarousel
            title='Touring Expert'
            categories={categories}
            fetchProducts={getTouringExpertProducts}
            queryKey='touringExpert'
          />
        </div>

        {/* Banner 2 */}
        {banner2 && (
          <FullWidthWrapper>
            <HomeBanner content={banner2} />
          </FullWidthWrapper>
        )}

        {/* Bestsellers carousel */}
        <div className='px-2 md:px-6'>
          <HomeProductCarousel
            title='Bestsellers'
            categories={categories}
            fetchProducts={getBestsellers}
            queryKey='bestsellers'
          />
        </div>

        {/* Banner 3 */}
        {banner3 && (
          <FullWidthWrapper>
            <HomeBanner content={banner3} />
          </FullWidthWrapper>
        )}

        {/* Featured Brands carousel */}
        <div className='px-2 md:px-6'>
          <HomeBrandCarousel categories={categories} />
        </div>
      </Layout>
    </Page>
  );
}
