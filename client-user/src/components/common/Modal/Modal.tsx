'use client';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  height?: string; // например, 'h-[80vh]'
}

export const Modal = ({
  open,
  onClose,
  className = '',
  children,
  height = 'h-[80vh]',
}: ModalProps) => {
  const modalRoot =
    typeof window !== 'undefined'
      ? document.getElementById('modal-root')
      : null;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!modalRoot) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className='fixed inset-0 z-[1000] flex items-center justify-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Затемнение */}
          <motion.div
            className='fixed inset-0 bg-black/40 z-[999]'
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Контент */}
          <motion.div
            className={cn(
              'bg-white rounded-xl p-4 z-[1000] relative flex flex-col w-11/12 max-w-xl',
              height,
              className,
            )}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
          >
            <button
              className='w-5 h-5 bg-transparent absolute top-4 right-4 cursor-pointer z-10'
              onClick={onClose}
            >
              <XIcon className='text-black' />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    modalRoot,
  );
};
