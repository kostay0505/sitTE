'use client';

import { useState, useEffect } from 'react';
import { uploadFile } from '@/api/files/methods';
import { apiUrl, api } from '@/api/api';
import { usePageTitle } from '@/components/AuthWrapper';

interface BannerSlide {
  image: string;
  imageMobile?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonPosition?: string;
  buttonBg?: string;
  buttonColor?: string;
}

interface BannerContent {
  slides: BannerSlide[];
}

type Banners = { banner1: BannerContent; banner2: BannerContent; banner3: BannerContent };

const POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

const POSITION_FLEX: Record<string, React.CSSProperties> = {
  'top-left':      { justifyContent: 'flex-start', alignItems: 'flex-start', padding: '10px' },
  'top-center':    { justifyContent: 'center',     alignItems: 'flex-start', paddingTop: '10px' },
  'top-right':     { justifyContent: 'flex-end',   alignItems: 'flex-start', padding: '10px' },
  'center-left':   { justifyContent: 'flex-start', alignItems: 'center',     paddingLeft: '10px' },
  'center':        { justifyContent: 'center',     alignItems: 'center' },
  'center-right':  { justifyContent: 'flex-end',   alignItems: 'center',     paddingRight: '10px' },
  'bottom-left':   { justifyContent: 'flex-start', alignItems: 'flex-end',   padding: '10px' },
  'bottom-center': { justifyContent: 'center',     alignItems: 'flex-end',   paddingBottom: '10px' },
  'bottom-right':  { justifyContent: 'flex-end',   alignItems: 'flex-end',   padding: '10px' },
};

async function getSiteContent(key: string): Promise<any> {
  const { data } = await api.get(`/site-content/${key}`);
  return data;
}

async function setSiteContent(key: string, value: any): Promise<void> {
  await api.put(`/site-content/${key}`, { value });
}

function toImgSrc(filename: string) {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  return `${apiUrl}/files/${filename}`;
}

function SlidePreview({ slide }: { slide: BannerSlide }) {
  const posStyle = POSITION_FLEX[slide.buttonPosition ?? 'center'] ?? POSITION_FLEX['center'];
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/5', overflow: 'hidden', borderRadius: '6px', background: '#1a1a1a', border: '1px solid #e5e7eb' }}>
      {slide.image && (
        <img src={toImgSrc(slide.image)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}

      {/* Safe zone overlay */}
      <div style={{
        position: 'absolute',
        top: '10%', bottom: '10%',
        left: '20%', right: '20%',
        border: '2px dashed rgba(250, 204, 21, 0.9)',
        borderRadius: '4px',
        pointerEvents: 'none',
      }}>
        <span style={{
          position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(250,204,21,0.95)', color: '#000', fontSize: '10px',
          padding: '1px 8px', borderRadius: '3px', whiteSpace: 'nowrap', fontWeight: 600,
        }}>
          Safe Zone — сюда важный контент
        </span>
      </div>

      {/* Button preview */}
      {slide.buttonText && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', ...posStyle }}>
          <span style={{
            background: slide.buttonBg || '#ffffff',
            color: slide.buttonColor || '#000000',
            padding: '5px 12px', borderRadius: '6px',
            fontSize: '11px', fontWeight: 700, boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}>
            {slide.buttonText}
          </span>
        </div>
      )}
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  background: '#fff', borderRadius: '8px', padding: '24px',
  marginBottom: '24px', border: '1px solid #e5e7eb',
};
const labelStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px', display: 'block',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '6px', fontSize: '14px', color: '#111', boxSizing: 'border-box',
};
const btnStyle = (bg = '#2563eb'): React.CSSProperties => ({
  background: bg, color: '#fff', border: 'none', borderRadius: '6px',
  padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
});

interface AboutOffer { title: string; desc: string; }
interface AboutContent {
  heroTitle: string; heroText: string;
  missionTitle: string; missionText: string;
  offersTitle: string; offers: AboutOffer[];
  shopTitle: string; shopText: string; shopSlug: string; shopButtonText: string;
  contactEmail: string;
}

const DEFAULT_ABOUT: AboutContent = {
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

export default function SiteContentPage() {
  const { setPageTitle } = usePageTitle();
  useEffect(() => { setPageTitle('Контент сайта'); }, []);

  const [preheader, setPreheader] = useState('');
  const [preheaderSaving, setPreheaderSaving] = useState(false);

  const [banners, setBanners] = useState<Banners>({
    banner1: { slides: [] },
    banner2: { slides: [] },
    banner3: { slides: [] },
  });
  const [bannerSaving, setBannerSaving] = useState<Record<string, boolean>>({});

  const [social, setSocial] = useState({ vk: '', telegram: '' });
  const [socialSaving, setSocialSaving] = useState(false);

  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
  const [aboutSaving, setAboutSaving] = useState(false);

  const [msg, setMsg] = useState('');
  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    getSiteContent('preheader').then(d => {
      if (typeof d === 'string') setPreheader(d);
      else if (d?.html) setPreheader(d.html);
    }).catch(() => {});

    (['banner1', 'banner2', 'banner3'] as const).forEach(key => {
      getSiteContent(key).then(d => {
        let c: BannerContent = { slides: [] };
        if (d && Array.isArray(d.slides)) c = d;
        else if (typeof d === 'string') { try { const p = JSON.parse(d); if (p?.slides) c = p; } catch {} }
        setBanners(prev => ({ ...prev, [key]: c }));
      }).catch(() => {});
    });

    getSiteContent('footer_social').then(d => {
      const src = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return {}; } })() : (d ?? {});
      setSocial({ vk: src.vk || '', telegram: src.telegram || '' });
    }).catch(() => {});

    getSiteContent('about_page').then(d => {
      if (d && typeof d === 'object') setAbout({ ...DEFAULT_ABOUT, ...d });
    }).catch(() => {});
  }, []);

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const { filename } = await uploadFile(fd);
    return filename;
  };

  const updateSlide = (bk: keyof Banners, idx: number, field: keyof BannerSlide, val: string) => {
    setBanners(prev => {
      const slides = [...prev[bk].slides];
      slides[idx] = { ...slides[idx], [field]: val };
      return { ...prev, [bk]: { ...prev[bk], slides } };
    });
  };

  const addSlide = (bk: keyof Banners) =>
    setBanners(prev => ({ ...prev, [bk]: { slides: [...prev[bk].slides, { image: '' }] } }));

  const removeSlide = (bk: keyof Banners, idx: number) =>
    setBanners(prev => ({ ...prev, [bk]: { slides: prev[bk].slides.filter((_, i) => i !== idx) } }));

  const savePreheader = async () => {
    setPreheaderSaving(true);
    try { await setSiteContent('preheader', { html: preheader }); showMsg('Прехедер сохранён ✓'); }
    catch { showMsg('Ошибка сохранения'); } finally { setPreheaderSaving(false); }
  };

  const saveBanner = async (bk: keyof Banners) => {
    setBannerSaving(p => ({ ...p, [bk]: true }));
    try { await setSiteContent(bk, banners[bk]); showMsg(`${bk} сохранён ✓`); }
    catch { showMsg('Ошибка сохранения'); } finally { setBannerSaving(p => ({ ...p, [bk]: false })); }
  };

  const saveSocial = async () => {
    setSocialSaving(true);
    try { await setSiteContent('footer_social', social); showMsg('Соцсети сохранены ✓'); }
    catch { showMsg('Ошибка сохранения'); } finally { setSocialSaving(false); }
  };

  const saveAbout = async () => {
    setAboutSaving(true);
    try { await setSiteContent('about_page', about); showMsg('Страница About сохранена ✓'); }
    catch { showMsg('Ошибка сохранения'); } finally { setAboutSaving(false); }
  };

  const updateOffer = (idx: number, field: keyof AboutOffer, val: string) =>
    setAbout(p => { const offers = [...p.offers]; offers[idx] = { ...offers[idx], [field]: val }; return { ...p, offers }; });
  const addOffer = () => setAbout(p => ({ ...p, offers: [...p.offers, { title: '', desc: '' }] }));
  const removeOffer = (idx: number) => setAbout(p => ({ ...p, offers: p.offers.filter((_, i) => i !== idx) }));

  const renderBanner = (bk: keyof Banners, label: string) => {
    const banner = banners[bk];
    return (
      <div key={bk} style={sectionStyle}>
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#111' }}>{label}</h2>

        {banner.slides.map((slide, idx) => (
          <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#f9fafb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600 }}>Слайд {idx + 1}</span>
              <button onClick={() => removeSlide(bk, idx)} style={{ ...btnStyle('#dc2626'), padding: '4px 10px', fontSize: '12px' }}>Удалить</button>
            </div>

            <SlidePreview slide={slide} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              {/* Desktop image */}
              <div>
                <label style={labelStyle}>🖥 Картинка для десктопа</label>
                {slide.image && <img src={toImgSrc(slide.image)} alt="" style={{ width: '100%', height: '50px', objectFit: 'cover', borderRadius: '4px', marginBottom: '6px' }} />}
                <input type="file" accept="image/*" style={{ fontSize: '12px' }} onChange={async e => {
                  const f = e.target.files?.[0]; if (!f) return;
                  try { updateSlide(bk, idx, 'image', await uploadImage(f)); } catch { showMsg('Ошибка загрузки'); }
                }} />
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '3px 0 0' }}>1920×600 px, webp/jpg</p>
              </div>

              {/* Mobile image */}
              <div>
                <label style={labelStyle}>📱 Картинка для мобайла</label>
                {slide.imageMobile && <img src={toImgSrc(slide.imageMobile)} alt="" style={{ width: '100%', height: '50px', objectFit: 'cover', borderRadius: '4px', marginBottom: '6px' }} />}
                <input type="file" accept="image/*" style={{ fontSize: '12px' }} onChange={async e => {
                  const f = e.target.files?.[0]; if (!f) return;
                  try { updateSlide(bk, idx, 'imageMobile', await uploadImage(f)); } catch { showMsg('Ошибка загрузки'); }
                }} />
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '3px 0 0' }}>750×500 px, webp/jpg</p>
              </div>

              {/* Button text */}
              <div>
                <label style={labelStyle}>Текст кнопки</label>
                <input style={inputStyle} value={slide.buttonText || ''} placeholder="Shop Now"
                  onChange={e => updateSlide(bk, idx, 'buttonText', e.target.value)} />
              </div>

              {/* Button link */}
              <div>
                <label style={labelStyle}>Ссылка кнопки</label>
                <input style={inputStyle} value={slide.buttonLink || ''} placeholder="/catalog"
                  onChange={e => updateSlide(bk, idx, 'buttonLink', e.target.value)} />
              </div>

              {/* Position */}
              <div>
                <label style={labelStyle}>Позиция кнопки</label>
                <select style={inputStyle} value={slide.buttonPosition || 'center'}
                  onChange={e => updateSlide(bk, idx, 'buttonPosition', e.target.value)}>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Colors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={labelStyle}>Фон кнопки</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="color" value={slide.buttonBg || '#ffffff'}
                      onChange={e => updateSlide(bk, idx, 'buttonBg', e.target.value)}
                      style={{ width: '36px', height: '34px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', padding: '2px' }} />
                    <input style={{ ...inputStyle, flex: 1 }} value={slide.buttonBg || '#ffffff'}
                      onChange={e => updateSlide(bk, idx, 'buttonBg', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Цвет текста</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="color" value={slide.buttonColor || '#000000'}
                      onChange={e => updateSlide(bk, idx, 'buttonColor', e.target.value)}
                      style={{ width: '36px', height: '34px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', padding: '2px' }} />
                    <input style={{ ...inputStyle, flex: 1 }} value={slide.buttonColor || '#000000'}
                      onChange={e => updateSlide(bk, idx, 'buttonColor', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => addSlide(bk)} style={btnStyle('#059669')}>+ Добавить слайд</button>
          <button onClick={() => saveBanner(bk)} disabled={bannerSaving[bk]} style={btnStyle()}>
            {bannerSaving[bk] ? 'Сохранение...' : 'Сохранить баннер'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 700, color: '#111' }}>Контент сайта</h1>

      {msg && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '6px', padding: '10px 16px', marginBottom: '16px', color: '#065f46', fontSize: '14px' }}>
          {msg}
        </div>
      )}

      {/* Preheader */}
      <div style={sectionStyle}>
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#111' }}>Прехедер</h2>
        <label style={labelStyle}>HTML-текст</label>
        <textarea value={preheader} onChange={e => setPreheader(e.target.value)}
          style={{ ...inputStyle, minHeight: '70px', fontFamily: 'monospace', resize: 'vertical' }}
          placeholder='Текст <a href="/catalog">Ссылка</a>' />
        <div style={{ marginTop: '6px', padding: '10px 14px', background: '#f3f4f6', borderRadius: '6px', fontSize: '13px', color: '#374151', minHeight: '36px' }}
          dangerouslySetInnerHTML={{ __html: preheader || '<em style="color:#9ca3af">Превью пустое</em>' }} />
        <button onClick={savePreheader} disabled={preheaderSaving} style={{ ...btnStyle(), marginTop: '10px' }}>
          {preheaderSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {/* Safe zone info */}
      <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px', fontSize: '13px', color: '#92400e' }}>
        <strong>Safe Zone (жёлтая рамка в превью)</strong> — область, в которую должен помещаться весь важный контент баннера (текст, логотипы).
        Края изображения за пределами safe zone могут обрезаться на разных экранах.
        Для десктопа рекомендуется <strong>1920×600 px</strong>, для мобайла <strong>750×500 px</strong>.
      </div>

      {renderBanner('banner1', 'Баннер 1 (после навигации по категориям)')}
      {renderBanner('banner2', 'Баннер 2 (после карусели Touring Expert)')}
      {renderBanner('banner3', 'Баннер 3 (после карусели Bestsellers)')}

      {/* Footer social */}
      <div style={sectionStyle}>
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#111' }}>Соцсети в футере</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>ВКонтакте</label>
            <input style={inputStyle} value={social.vk} placeholder="https://vk.com/..."
              onChange={e => setSocial(p => ({ ...p, vk: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Telegram</label>
            <input style={inputStyle} value={social.telegram} placeholder="https://t.me/..."
              onChange={e => setSocial(p => ({ ...p, telegram: e.target.value }))} />
          </div>
        </div>
        <button onClick={saveSocial} disabled={socialSaving} style={{ ...btnStyle(), marginTop: '10px' }}>
          {socialSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {/* About page editor */}
      <div style={sectionStyle}>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#111' }}>Страница About Us</h2>

        {/* Hero */}
        <p style={{ fontWeight: 600, fontSize: '14px', color: '#374151', margin: '0 0 10px' }}>Герой</p>
        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Заголовок</label>
            <input style={inputStyle} value={about.heroTitle}
              onChange={e => setAbout(p => ({ ...p, heroTitle: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Описание</label>
            <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={about.heroText}
              onChange={e => setAbout(p => ({ ...p, heroText: e.target.value }))} />
          </div>
        </div>

        {/* Mission */}
        <p style={{ fontWeight: 600, fontSize: '14px', color: '#374151', margin: '0 0 10px' }}>Наша миссия</p>
        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Заголовок</label>
            <input style={inputStyle} value={about.missionTitle}
              onChange={e => setAbout(p => ({ ...p, missionTitle: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Текст</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={about.missionText}
              onChange={e => setAbout(p => ({ ...p, missionText: e.target.value }))} />
          </div>
        </div>

        {/* What we offer */}
        <p style={{ fontWeight: 600, fontSize: '14px', color: '#374151', margin: '0 0 10px' }}>Что мы предлагаем</p>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Заголовок секции</label>
            <input style={inputStyle} value={about.offersTitle}
              onChange={e => setAbout(p => ({ ...p, offersTitle: e.target.value }))} />
          </div>
          {about.offers.map((offer, idx) => (
            <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', marginBottom: '10px', background: '#f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Карточка {idx + 1}</span>
                <button onClick={() => removeOffer(idx)} style={{ ...btnStyle('#dc2626'), padding: '3px 8px', fontSize: '12px' }}>Удалить</button>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div>
                  <label style={labelStyle}>Название</label>
                  <input style={inputStyle} value={offer.title}
                    onChange={e => updateOffer(idx, 'title', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Описание</label>
                  <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={offer.desc}
                    onChange={e => updateOffer(idx, 'desc', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addOffer} style={{ ...btnStyle('#059669'), padding: '6px 14px', fontSize: '13px' }}>+ Добавить карточку</button>
        </div>

        {/* Shop block */}
        <p style={{ fontWeight: 600, fontSize: '14px', color: '#374151', margin: '0 0 10px' }}>Блок магазина</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Заголовок</label>
            <input style={inputStyle} value={about.shopTitle}
              onChange={e => setAbout(p => ({ ...p, shopTitle: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Подзаголовок</label>
            <input style={inputStyle} value={about.shopText}
              onChange={e => setAbout(p => ({ ...p, shopText: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Slug магазина (часть URL после /shop/)</label>
            <input style={inputStyle} value={about.shopSlug} placeholder="touring_expert"
              onChange={e => setAbout(p => ({ ...p, shopSlug: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Текст кнопки</label>
            <input style={inputStyle} value={about.shopButtonText}
              onChange={e => setAbout(p => ({ ...p, shopButtonText: e.target.value }))} />
          </div>
        </div>

        {/* Contact */}
        <p style={{ fontWeight: 600, fontSize: '14px', color: '#374151', margin: '0 0 10px' }}>Контакты</p>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} value={about.contactEmail} placeholder="email@example.com"
            onChange={e => setAbout(p => ({ ...p, contactEmail: e.target.value }))} />
        </div>

        <button onClick={saveAbout} disabled={aboutSaving} style={btnStyle()}>
          {aboutSaving ? 'Сохранение...' : 'Сохранить страницу About'}
        </button>
      </div>
    </div>
  );
}
