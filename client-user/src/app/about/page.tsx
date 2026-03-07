'use client';

import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { Footer } from '@/components/Footer';
import { useWindowResize } from '@/hooks/useWindowResize';

const DESKTOP_HEADER_HEIGHT = 149;

export default function AboutPage() {
  const { width } = useWindowResize();
  const isMobile = width > 0 && width < 768;

  return (
    <Page back={true}>
      <div className='relative h-full flex flex-col' style={{ paddingTop: isMobile ? 0 : DESKTOP_HEADER_HEIGHT }}>
        <div className='flex-1 overflow-y-auto scrollbar-hide'>
          <Layout className='max-w-[900px] mx-auto py-12 px-4 md:px-8'>

            {/* Hero */}
            <div className='mb-10'>
              <h1 className='text-4xl md:text-5xl font-bold text-black mb-4'>About Touring Expert</h1>
              <p className='text-lg text-gray-600 leading-relaxed max-w-2xl'>
                Touring Expert Marketplace (TEM) is a professional platform for buying and selling
                high-quality audio, lighting, and staging equipment for touring, events, and live production.
              </p>
            </div>

            {/* Mission */}
            <div className='mb-10 p-6 bg-gray-50 rounded-2xl'>
              <h2 className='text-2xl font-bold text-black mb-3'>Our Mission</h2>
              <p className='text-gray-600 leading-relaxed'>
                We connect professional equipment sellers with buyers worldwide — making it easier
                to source trusted gear for your next tour, festival, or installation.
                Every listing on TEM goes through moderation to ensure quality and accuracy.
              </p>
            </div>

            {/* What we offer */}
            <div className='mb-10'>
              <h2 className='text-2xl font-bold text-black mb-6'>What We Offer</h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {[
                  { title: 'Professional Gear', desc: 'Audio, lighting, video, staging and rigging equipment from verified sellers.' },
                  { title: 'Direct Deals', desc: 'Connect directly with sellers. No middlemen, transparent pricing.' },
                  { title: 'Telegram Mini App', desc: 'Access the full marketplace inside Telegram — fast and convenient.' },
                ].map(item => (
                  <div key={item.title} className='p-5 rounded-xl border border-gray-200'>
                    <h3 className='font-semibold text-black mb-2'>{item.title}</h3>
                    <p className='text-sm text-gray-500 leading-relaxed'>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shop link */}
            <div className='mb-10 p-6 bg-black rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4'>
              <div>
                <h2 className='text-xl font-bold text-white mb-1'>Touring Expert Official Store</h2>
                <p className='text-gray-400 text-sm'>Browse our curated selection of professional equipment</p>
              </div>
              <a
                href='/shop/touring_expert'
                className='shrink-0 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition whitespace-nowrap'
              >
                Visit Shop →
              </a>
            </div>

            {/* Contact */}
            <div className='mb-4'>
              <h2 className='text-2xl font-bold text-black mb-3'>Contact</h2>
              <p className='text-gray-600'>
                Questions?{' '}
                <a href='mailto:touringexperteu@gmail.com' className='text-black underline hover:no-underline'>
                  touringexperteu@gmail.com
                </a>
              </p>
            </div>

          </Layout>
          <Footer />
        </div>
      </div>
    </Page>
  );
}
