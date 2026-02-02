'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Modal } from '../Modal/Modal';

const PDFViewer = dynamic(() => import('../PDFViewer/PDFViewer').then(mod => ({ default: mod.PDFViewer })), {
  ssr: false,
  loading: () => <div>Загрузка PDF...</div>
});

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: string | File;
  title: string;
  loadPlaceholder?: string;
}

export const PDFModal: React.FC<PDFModalProps> = ({
  isOpen,
  onClose,
  file,
  title,
  loadPlaceholder,
}) => {
  return (
    <Modal open={isOpen} onClose={onClose} height='h-[90vh]'>
      <div className='flex flex-col h-full'>
        <div className='flex items-center justify-between mb-4 flex-shrink-0'>
          <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
        </div>

        <div className='flex-1 overflow-y-auto'>
          <PDFViewer file={file} loadPlaceholder={loadPlaceholder} />
        </div>
      </div>
    </Modal>
  );
};
