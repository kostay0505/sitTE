'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PDFModal } from './common/PDFModal/PDFModal';
import { Checkbox } from './common/Checkbox/Checkbox';

interface Props {
  onAccept: () => void;
}

export function WelcomeScreen({ onAccept }: Props) {
  const [checked, setChecked] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentPdfFile, setCurrentPdfFile] = useState('');
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');

  const openPdf = (file: string, title: string) => {
    setCurrentPdfFile(file);
    setCurrentPdfTitle(title);
    setPdfModalOpen(true);
  };

  return (
    <main className='min-h-screen w-full flex items-center justify-center px-4 bg-[#F5F5FA]'>
      <div
        className='
          w-full max-w-[560px]
          rounded-2xl
          bg-white
          shadow-[0_6px_24px_rgba(0,0,0,0.06)]
          border border-[#ECEEF2]
          px-6 py-7 md:px-8 md:py-9
        '
      >
        {/* Logo */}
        <div className='flex justify-center mb-6'>
          <Image
            src='/images/logo.png'
            alt='Touring Expert'
            width={160}
            height={160}
            priority
            unoptimized
            className='h-16 w-auto md:h-20'
          />
        </div>

        {/* Title + lead */}
        <h1 className='text-xl md:text-2xl font-semibold text-[#1E293B] tracking-[-0.01em] mb-2'>
          Добро пожаловать в Touring&nbsp;Expert
        </h1>
        <p className='text-sm md:text-[15px] leading-6 text-[#475569] mb-6'>
          Сообщество для профессионалов мира концертного оборудования: площадки,
          сервисы, истории и удобные инструменты в одном месте.
        </p>

        {/* Agreement */}
        <Checkbox
          checked={checked}
          onChange={setChecked}
          label={
            <>
              Я принимаю{' '}
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation();
                  openPdf(
                    '/offer_agreement.pdf',
                    'Пользовательское соглашение',
                  );
                }}
                className='underline underline-offset-2 decoration-[#CBD5E1] hover:decoration-[#94A3B8] transition'
              >
                Пользовательское соглашение
              </button>{' '}
              и{' '}
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation();
                  openPdf('/privacy_policy.pdf', 'Политика конфиденциальности');
                }}
                className='underline underline-offset-2 decoration-[#CBD5E1] hover:decoration-[#94A3B8] transition'
              >
                Политику конфиденциальности
              </button>
              .
            </>
          }
          className='mb-7'
        />

        <button
          type='button'
          disabled={!checked}
          onClick={onAccept}
          className={`
            w-full h-11 md:h-12 rounded-xl font-medium
            transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed
            bg-[#111827] text-white
            hover:bg-black focus:outline-none focus:ring-4 focus:ring-black/10
          `}
        >
          Продолжить
        </button>
      </div>

      <PDFModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        file={currentPdfFile}
        title={currentPdfTitle}
        loadPlaceholder='Открытие документа'
      />
    </main>
  );
}
