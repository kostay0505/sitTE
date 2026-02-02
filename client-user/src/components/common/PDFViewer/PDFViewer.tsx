'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentCallback } from 'react-pdf/dist/shared/types.js';

// Init PDF worker - iOS < 18
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
  file: string | File | null;
  loadPlaceholder?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  file,
  loadPlaceholder = 'Загрузка...',
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: DocumentCallback) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('Не удалось загрузить PDF документ');
  }

  if (!file) {
    return <div className='text-black p-4 text-center'>Файл не выбран</div>;
  }

  return (
    <div className='relative bg-white'>
      <div className='flex flex-col items-center'>
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className='w-full flex flex-col items-center gap-0'
          loading={<div className='text-black p-4'>{loadPlaceholder}</div>}
          error={
            <div className='text-black p-4 text-center'>
              {error || 'Ошибка загрузки PDF'}
            </div>
          }
        >
          {Array.from({ length: numPages || 0 }, (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderMode='canvas'
              width={
                typeof window !== 'undefined'
                  ? Math.min(window.innerWidth - 40, 800)
                  : 390
              }
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className='w-full'
              loading={
                <div className='text-black p-4'>
                  Загрузка страницы {index + 1}...
                </div>
              }
            />
          ))}
        </Document>
      </div>
    </div>
  );
};
