'use client';
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContactModal } from '../Product/ContactModal';
import { FileText } from 'lucide-react';
import { toImageSrc } from '@/utils/toImageSrc';
import { cn } from '@/utils/cn';
import { PDFModal } from '../common/PDFModal/PDFModal';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|svg|bmp|avif|heic|heif)$/i;

export interface JobItemUI {
  id: string;
  title: string;
  city: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  telegramUsername?: string;
  address?: string;
  description: string;
  date?: string;
  files?: string[];
}

export const JobDetails = ({ job }: { job: JobItemUI }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const username = job.telegramUsername
    ? job.telegramUsername.replace(/^@/, '')
    : null;

  return (
    <AnimatePresence>
      <motion.div
        key={job.id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className='overflow-hidden'
      >
        <div className='p-4 pb-2 pt-0 text-black space-y-2'>
          <div className='line-clamp-1'>
            <strong className='text-sm'>Контактное лицо:</strong>{' '}
            <span className='text-xs md:text-sm'>{job.contactPerson}</span>
          </div>
          <div className='line-clamp-1'>
            <strong className='text-sm'>Телефон:</strong>{' '}
            <span className='text-xs md:text-sm'>{job.contactPhone}</span>
          </div>
          {job.telegramUsername && (
            <div className='line-clamp-1'>
              <strong className='text-sm'>Telegram:</strong>{' '}
              <span className='text-xs md:text-sm'>{job.telegramUsername}</span>
            </div>
          )}
          <div className='line-clamp-1'>
            <strong className='text-sm'>Город:</strong>{' '}
            <span className='text-xs md:text-sm'>{job.city}</span>
          </div>
          {job.address && (
            <div className='line-clamp-1'>
              <strong className='text-sm'>Адрес:</strong>{' '}
              <span className='text-xs md:text-sm'>{job.address}</span>
            </div>
          )}
          <div>
            <strong className='text-sm'>Описание:</strong>{' '}
            <span className='text-xs md:text-sm'>{job.description}</span>
          </div>
          {job.files && job.files.length > 0 && (
            <div>
              <strong className='text-sm'>Файлы:</strong>
              <div className='mt-2 space-y-2'>
                {job.files.map((url, idx) => (
                  <DocRow
                    key={url}
                    label={url.split('/').pop() ?? `Файл ${idx + 1}`}
                    href={toImageSrc(url)}
                  />
                ))}
              </div>
            </div>
          )}
          <div className='flex justify-end mt-4'>
            <button
              type='button'
              onClick={() => setIsContactModalOpen(true)}
              className='flex items-center gap-2 text-black text-sm md:text-base hover:opacity-70 transition'
            >
              Связаться
            </button>
          </div>
        </div>

        <ContactModal
          open={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          username={username}
          email={job.contactEmail ?? null}
          phone={job.contactPhone ?? null}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export function DocRow({ label, href }: { label: string; href?: string }) {
  const [pdfOpen, setPdfOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const isImage = useMemo(() => {
    if (!href) return false;
    const clean = href.split('?')[0];
    return IMAGE_EXT_RE.test(clean);
  }, [href]);

  const onOpen = () => {
    if (!href) return;
    if (isImage) {
      imgRef.current?.click();
    } else {
      setPdfOpen(true);
    }
  };

  const content = (
    <div className='flex items-center gap-2 min-w-0'>
      <FileText className='w-4 h-4 shrink-0' />
      <span
        className={cn('truncate text-sm', href && 'underline cursor-pointer')}
      >
        {label}
      </span>
    </div>
  );

  const imageContent = (
    <div className='flex items-center gap-2 min-w-0'>
      <Zoom>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={href} alt={label} className='w-5 h-5' />
      </Zoom>
      <span
        className={cn('truncate text-sm', href && 'underline cursor-zoom-in')}
        onClick={() => imgRef.current?.click()}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className='flex items-center gap-3 bg-white rounded-md px-1 py-0.5'>
      <button type='button' className='min-w-0' onClick={onOpen}>
        {!isImage ? content : imageContent}
      </button>

      {href && !isImage && (
        <PDFModal
          isOpen={pdfOpen}
          onClose={() => setPdfOpen(false)}
          file={href}
          title='Документ'
          loadPlaceholder='Открытие документа'
        />
      )}
    </div>
  );
}
