'use client';

import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { Footer } from '@/components/Footer';
import { useWindowResize } from '@/hooks/useWindowResize';
import { api } from '@/api/api';

const DESKTOP_HEADER_HEIGHT = 149;

interface AboutOffer { title: string; desc: string; }
interface AboutContent {
  heroTitle: string; heroText: string;
  missionTitle: string; missionText: string;
  offersTitle: string; offers: AboutOffer[];
  shopTitle: string; shopText: string; shopSlug: string; shopButtonText: string;
  contactEmail: string;
}

const DEFAULT: AboutContent = {
  heroTitle: 'About Touring Expert',
  heroText: 'Touring Expert Marketplace (TEM) is a professional platform for buying and selling high-quality audio, lighting, and staging equipment for touring, events, and live production.',
  missionTitle: 'Our Mission',
  missionText: 'We connect professional equipment sellers with buyers worldwide — making it easier to source trusted gear for your next tour, festival, or installation. Every listing on TEM goes through moderation to ensure quality and accuracy.',
  offersTitle: 'What We Offer',
  offers: [
    { title: 'Professional Gear', desc: 'Audio, lighting, video, staging and rigging equipment from verified sellers.' },
    { title: 'Direct Deals', desc: 'Connect directly with sellers. No middlemen, transparent pricing.' },
    { title: 'Telegram Mini App', desc: 'Access the full marketplace inside Telegram — fast and convenient.' },
  ],
  shopTitle: 'Touring Expert Official Store',
  shopText: 'Browse our curated selection of professional equipment',
  shopSlug: 'touring_expert',
  shopButtonText: 'Visit Shop →',
  contactEmail: 'touringexperteu@gmail.com',
};

export default function AboutPage() {
  const { width } = useWindowResize();
  const isMobile = width > 0 && width < 768;
  const [content, setContent] = useState<AboutContent>(DEFAULT);

  useEffect(() => {
    api.get('/site-content/about_page').then(({ data }) => {
      if (data && typeof data === 'object') setContent({ ...DEFAULT, ...data });
    }).catch(() => {});
  }, []);

  return (
    <Page back={true}>
      <div className='relative h-full flex flex-col' style={{ paddingTop: isMobile ? 0 : DESKTOP_HEADER_HEIGHT }}>
        <div className='flex-1 overflow-y-auto scrollbar-hide'>
          <Layout className='max-w-[900px] mx-auto py-12 px-4 md:px-8'>

            {/* Hero */}
            <div className='mb-10'>
              <h1 className='text-4xl md:text-5xl font-bold text-black mb-4'>{content.heroTitle}</h1>
              <p className='text-lg text-gray-600 leading-relaxed max-w-2xl'>{content.heroText}</p>
            </div>

            {/* Mission */}
            <div className='mb-10 p-6 bg-gray-50 rounded-2xl'>
              <h2 className='text-2xl font-bold text-black mb-3'>{content.missionTitle}</h2>
              <p className='text-gray-600 leading-relaxed'>{content.missionText}</p>
            </div>

            {/* What we offer */}
            {content.offers.length > 0 && (
              <div className='mb-10'>
                <h2 className='text-2xl font-bold text-black mb-6'>{content.offersTitle}</h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {content.offers.map((item, i) => (
                    <div key={i} className='p-5 rounded-xl border border-gray-200'>
                      <h3 className='font-semibold text-black mb-2'>{item.title}</h3>
                      <p className='text-sm text-gray-500 leading-relaxed'>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shop link */}
            {content.shopSlug && (
              <div className='mb-10 p-6 bg-black rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4'>
                <div>
                  <h2 className='text-xl font-bold text-white mb-1'>{content.shopTitle}</h2>
                  <p className='text-gray-400 text-sm'>{content.shopText}</p>
                </div>
                <a
                  href={`/shop/${content.shopSlug}`}
                  className='shrink-0 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition whitespace-nowrap'
                >
                  {content.shopButtonText}
                </a>
              </div>
            )}

            {/* Contact */}
            {content.contactEmail && (
              <div className='mb-4'>
                <h2 className='text-2xl font-bold text-black mb-3'>Contact</h2>
                <p className='text-gray-600'>
                  Questions?{' '}
                  <a href={`mailto:${content.contactEmail}`} className='text-black underline hover:no-underline'>
                    {content.contactEmail}
                  </a>
                </p>
              </div>
            )}

          </Layout>
          <Footer />
        </div>
      </div>
    </Page>
  );
}
