'use client';

import React, { useMemo, useRef, useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { Upload, X, FileText, GripVertical } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toImageSrc } from '@/utils/toImageSrc';
import { Element, scroller } from 'react-scroll';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { PDFModal } from '../PDFModal/PDFModal';

type ResolveUrl = (urlOrName: string) => string;

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|svg|bmp|avif)$/i;
const VIDEO_EXT_RE = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i;
const isImageFile = (f: File) =>
  f.type.startsWith('image/') || IMAGE_EXT_RE.test(f.name);
const isVideoFile = (f: File) =>
  f.type.startsWith('video/') || VIDEO_EXT_RE.test(f.name);
const isImageUrlLike = (url: string) => IMAGE_EXT_RE.test(url.split('?')[0]);
const isVideoUrlLike = (url: string) => VIDEO_EXT_RE.test(url.split('?')[0]);
const humanizeName = (url: string) => {
  try {
    const u = new URL(url);
    const pathname = u.pathname.split('/').pop() || 'файл';
    return decodeURIComponent(pathname);
  } catch {
    return url.split('/').pop() || 'файл';
  }
};

type SingleProps = {
  variant: 'single';
  label?: string;
  file: File | null;
  /** Имя файла или относительный путь с бэка — прогонится через resolveUrl */
  initialUrl?: string;
  onFileChange: (file: File | null) => void;
  accept?: string;
  error?: string;
  className?: string;
  /** Как резолвить существующие URL/имена; по умолчанию toImageSrc */
  resolveUrl?: ResolveUrl;

  withAutoScroll?: boolean;
  scrollName?: string;
  scrollOffset?: number;
  scrollDelayMs?: number;
};

type MultipleProps = {
  variant: 'multiple';
  label?: string;
  existingUrls?: string[];
  onRemoveExisting?: (idx: number) => void;
  onReorderExisting?: (newOrder: string[]) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  error?: string;
  className?: string;
  resolveUrl?: ResolveUrl;
  showCount?: boolean;
  enableDragAndDrop?: boolean;

  withAutoScroll?: boolean;
  scrollName?: string;
  scrollOffset?: number;
  scrollDelayMs?: number;
};

export type FileUploadProps = SingleProps | MultipleProps;

export const FileUpload: React.FC<FileUploadProps> = props => {
  if (props.variant === 'single') return <SingleFileUpload {...props} />;
  return <MultipleFileUpload {...props} />;
};

/* -------------------- SINGLE -------------------- */

const SingleFileUpload: React.FC<SingleProps> = ({
  label = 'Обложка (превью)',
  file,
  initialUrl,
  onFileChange,
  accept = '.png,.jpg,.jpeg,.webp,.gif,.avif,.svg',
  error,
  className,
  resolveUrl = toImageSrc,
  withAutoScroll,
  scrollName,
  scrollOffset = -96,
  scrollDelayMs = 150,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const localUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ''),
    [file],
  );
  useEffect(
    () => () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    },
    [localUrl],
  );

  const rawPreview = file ? localUrl : initialUrl || '';
  const previewUrl = rawPreview
    ? file
      ? rawPreview
      : resolveUrl(rawPreview)
    : '';

  // определяем тип файла для отображения
  const showAsImage = file
    ? isImageFile(file)
    : initialUrl
      ? isImageUrlLike(initialUrl)
      : false;
  
  const showAsVideo = file
    ? isVideoFile(file)
    : initialUrl
      ? isVideoUrlLike(initialUrl)
      : false;

  const autoId = useId();
  const anchorName = useMemo(
    () => scrollName ?? `input-${autoId}`,
    [scrollName, autoId],
  );

  return (
    <Element name={anchorName} className={cn('space-y-2', className)}>
      <button
        type='button'
        onClick={() => {
          inputRef.current?.click();
          if (withAutoScroll && anchorName)
            scroller.scrollTo(anchorName, {
              duration: 500,
              smooth: true,
              offset: scrollOffset,
              delay: scrollDelayMs,
            });
        }}
        className='w-full border bg-white rounded-xl py-2 px-3 flex items-center justify-between text-sm h-[40px]'
        title='Загрузить файл'
      >
        {label}
        <Upload className='w-4 h-4' />
        <input
          ref={inputRef}
          type='file'
          accept={accept}
          className='hidden'
          onChange={e => {
            const f = e.target.files?.[0] || null;
            onFileChange(f);
            e.currentTarget.value = '';
          }}
        />
      </button>

      <div className='relative w-full min-h-20 bg-white rounded-xl overflow-hidden flex items-center justify-center'>
        {previewUrl ? (
          showAsImage ? (
            <>
              <div className='relative w-full h-40'>
                <Zoom canSwipeToUnzoom>
                  <Image
                    src={previewUrl}
                    alt='preview'
                    fill
                    unoptimized
                    className='object-contain'
                  />
                </Zoom>
              </div>
              {file && (
                <button
                  type='button'
                  onClick={() => onFileChange(null)}
                  className='absolute top-2 right-2 bg-white/80 rounded-full p-1'
                  title='Удалить выбранный файл'
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </>
          ) : showAsVideo ? (
            <>
              <div className='relative w-full h-40'>
                <video
                  src={previewUrl}
                  controls
                  className='w-full h-full object-contain'
                />
              </div>
              {file && (
                <button
                  type='button'
                  onClick={() => onFileChange(null)}
                  className='absolute top-2 right-2 bg-white/80 rounded-full p-1'
                  title='Удалить выбранный файл'
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </>
          ) : (
            <div className='w-full flex items-center justify-between gap-3 px-3 py-2'>
              <div className='flex items-center gap-2 min-w-0'>
                <FileText className='w-4 h-4 shrink-0' />
                <button
                  className='truncate text-sm underline'
                  type='button'
                  onClick={() => setPdfModalOpen(true)}
                >
                  {humanizeName(previewUrl)}
                </button>
              </div>
              {file && (
                <button
                  type='button'
                  onClick={() => onFileChange(null)}
                  className='bg-white/80 rounded-full p-1'
                  title='Удалить выбранный файл'
                >
                  <X className='w-4 h-4' />
                </button>
              )}

              {file && (
                <PDFModal
                  isOpen={pdfModalOpen}
                  onClose={() => setPdfModalOpen(false)}
                  file={file}
                  title={'Документ'}
                  loadPlaceholder='Открытие документа'
                />
              )}
            </div>
          )
        ) : (
          <div className='text-xs text-gray-500 py-6'>Файл не выбран</div>
        )}
      </div>

      {error && <div className='text-xs text-red-600'>{error}</div>}
    </Element>
  );
};

/* -------------------- MULTIPLE -------------------- */

/* -------------------- MULTIPLE -------------------- */

const MultipleFileUpload: React.FC<MultipleProps> = ({
  label = 'Добавить файлы',
  existingUrls = [],
  onRemoveExisting,
  onReorderExisting,
  files,
  onFilesChange,
  maxFiles = 5,
  accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif,.svg,.bmp,.avif',
  error,
  className,
  resolveUrl = toImageSrc,
  showCount = true,
  enableDragAndDrop = false,
  withAutoScroll,
  scrollName,
  scrollOffset = -96,
  scrollDelayMs = 150,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Сделаем привязку ObjectURL к оригинальному индексу файла
  const localUrls = useMemo(() => {
    return files.map((f, idx) => ({
      idx,
      url: URL.createObjectURL(f),
      isImage: isImageFile(f),
      isVideo: isVideoFile(f),
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      localUrls.forEach(o => URL.revokeObjectURL(o.url));
    };
  }, [localUrls]);

  const currentCount = existingUrls.length + files.length;
  const canAdd = currentCount < maxFiles;

  // Сохраняем ОРИГИНАЛЬНЫЙ индекс при разбиении
  const existingWithIndex = existingUrls.map((u, idx) => ({ u, idx }));
  const exImages = existingWithIndex.filter(({ u }) => isImageUrlLike(u));
  const exVideos = existingWithIndex.filter(({ u }) => isVideoUrlLike(u));
  const exDocs = existingWithIndex.filter(({ u }) => !isImageUrlLike(u) && !isVideoUrlLike(u));

  const newWithIndex = files.map((f, idx) => ({ f, idx }));
  const newImgFiles = newWithIndex.filter(({ f }) => isImageFile(f));
  const newVideoFiles = newWithIndex.filter(({ f }) => isVideoFile(f));
  const newDocFiles = newWithIndex.filter(({ f }) => !isImageFile(f) && !isVideoFile(f));

  const allImages = [
    ...exImages.map(({ u, idx }) => ({
      url: u,
      originalIndex: idx,
      type: 'existing' as const,
    })),
    ...newImgFiles.map(({ f, idx }) => ({
      file: f,
      originalIndex: idx,
      type: 'new' as const,
    })),
  ];

  const allVideos = [
    ...exVideos.map(({ u, idx }) => ({
      url: u,
      originalIndex: idx,
      type: 'existing' as const,
    })),
    ...newVideoFiles.map(({ f, idx }) => ({
      file: f,
      originalIndex: idx,
      type: 'new' as const,
    })),
  ];

  const allDocs = [
    ...exDocs.map(({ u, idx }) => ({
      url: u,
      originalIndex: idx,
      type: 'existing' as const,
    })),
    ...newDocFiles.map(({ f, idx }) => ({
      file: f,
      originalIndex: idx,
      type: 'new' as const,
    })),
  ];

  const autoId = useId();
  const anchorName = useMemo(
    () => scrollName ?? `input-${autoId}`,
    [scrollName, autoId],
  );

  const [draggedItem, setDraggedItem] = useState<{
    type: 'existing' | 'new';
    index: number;
  } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (
    e: React.DragEvent,
    type: 'existing' | 'new',
    index: number,
  ) => {
    if (!enableDragAndDrop) return;
    setDraggedItem({ type, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!enableDragAndDrop || !draggedItem) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    if (!enableDragAndDrop) return;
    setDragOverIndex(null);
  };

  const handleDrop = (
    e: React.DragEvent,
    targetIndex: number,
    itemType: 'images' | 'videos' | 'docs',
  ) => {
    if (!enableDragAndDrop || !draggedItem) return;
    e.preventDefault();

    const { type, index: sourceIndex } = draggedItem;
    const items = itemType === 'images' ? allImages : itemType === 'videos' ? allVideos : allDocs;

    if (sourceIndex === targetIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const sourceItem = items[sourceIndex];
    if (!sourceItem) return;

    if (sourceItem.type === 'existing' && onReorderExisting) {
      const newExistingUrls = [...existingUrls];
      const [movedUrl] = newExistingUrls.splice(sourceItem.originalIndex, 1);

      const targetItem = items[targetIndex];
      if (targetItem && targetItem.type === 'existing') {
        newExistingUrls.splice(targetItem.originalIndex, 0, movedUrl);
      } else {
        newExistingUrls.push(movedUrl);
      }
      onReorderExisting(newExistingUrls);
    } else if (sourceItem.type === 'new') {
      const newFiles = [...files];
      const [movedFile] = newFiles.splice(sourceItem.originalIndex, 1);

      const targetItem = items[targetIndex];
      if (targetItem && targetItem.type === 'new') {
        newFiles.splice(targetItem.originalIndex, 0, movedFile);
      } else {
        newFiles.unshift(movedFile);
      }
      onFilesChange(newFiles);
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    if (!enableDragAndDrop) return;
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <button
        type='button'
        onClick={() => {
          inputRef.current?.click();
          if (withAutoScroll && anchorName)
            scroller.scrollTo(anchorName, {
              duration: 500,
              smooth: true,
              offset: scrollOffset,
              delay: scrollDelayMs,
            });
        }}
        className={cn(
          'w-full border bg-white rounded-xl py-2 px-3 flex items-center justify-between text-sm h-[40px]',
          !canAdd && 'opacity-50 cursor-not-allowed',
        )}
        disabled={!canAdd}
        title={canAdd ? 'Добавить' : 'Достигнут лимит'}
      >
        {label}
        <Upload className='w-4 h-4' />
        <input
          ref={inputRef}
          type='file'
          multiple
          accept={accept}
          className='hidden'
          onChange={e => {
            const picked = Array.from(e.target.files || []);
            const room = Math.max(0, maxFiles - currentCount);
            const next = [...files, ...picked.slice(0, room)];
            onFilesChange(next);
            e.currentTarget.value = '';
          }}
        />
      </button>

      {/* Документы */}
      {exDocs.length + newDocFiles.length > 0 && (
        <div className='space-y-1'>
          <div className='text-xs text-gray-500'>Файлы</div>
          <div className='space-y-2'>
            {exDocs.map(({ u, idx }) => {
              const src = resolveUrl(u);
              return (
                <DraggableDocRow
                  key={`ex-doc-${idx}`}
                  label={humanizeName(src)}
                  href={src}
                  onRemove={
                    onRemoveExisting ? () => onRemoveExisting(idx) : undefined
                  }
                  enableDragAndDrop={enableDragAndDrop}
                  index={idx}
                  type='existing'
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e, index) => handleDrop(e, index, 'docs')}
                  onDragEnd={handleDragEnd}
                  isDragged={
                    draggedItem?.type === 'existing' &&
                    draggedItem.index === idx
                  }
                  isDragOver={dragOverIndex === idx}
                  itemType='docs'
                />
              );
            })}
            {newDocFiles.map(({ f, idx }) => (
              <DraggableDocRow
                key={`new-doc-${idx}`}
                label={f.name}
                onRemove={() =>
                  onFilesChange(files.filter((_, i) => i !== idx))
                }
                href={f}
                enableDragAndDrop={enableDragAndDrop}
                index={idx}
                type='new'
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e, index) => handleDrop(e, index, 'docs')}
                onDragEnd={handleDragEnd}
                isDragged={
                  draggedItem?.type === 'new' && draggedItem.index === idx
                }
                isDragOver={dragOverIndex === idx}
                itemType='docs'
              />
            ))}
          </div>
        </div>
      )}

      {/* Картинки */}
      {exImages.length + newImgFiles.length > 0 && (
        <div className='space-y-1'>
          <div className='text-xs text-gray-500'>Изображения</div>
          <div className='flex overflow-x-auto gap-2 whitespace-nowrap scrollbar-hide py-1'>
            {exImages.map(({ u, idx }) => {
              const src = resolveUrl(u);
              return (
                <DraggableThumb
                  key={`ex-img-${idx}`}
                  src={src}
                  onRemove={
                    onRemoveExisting ? () => onRemoveExisting(idx) : undefined
                  }
                  enableDragAndDrop={enableDragAndDrop}
                  index={idx}
                  type='existing'
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e, index) => handleDrop(e, index, 'images')}
                  onDragEnd={handleDragEnd}
                  isDragged={
                    draggedItem?.type === 'existing' &&
                    draggedItem.index === idx
                  }
                  isDragOver={dragOverIndex === idx}
                  itemType='images'
                />
              );
            })}

            {localUrls
              .filter(o => o.isImage)
              .map(({ idx, url }) => (
                <DraggableThumb
                  key={`new-img-${idx}`}
                  src={url}
                  onRemove={() =>
                    onFilesChange(files.filter((_, i) => i !== idx))
                  }
                  enableDragAndDrop={enableDragAndDrop}
                  index={idx}
                  type='new'
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e, index) => handleDrop(e, index, 'images')}
                  onDragEnd={handleDragEnd}
                  isDragged={
                    draggedItem?.type === 'new' && draggedItem.index === idx
                  }
                  isDragOver={dragOverIndex === idx}
                  itemType='images'
                />
              ))}
          </div>
        </div>
      )}

      {/* Видео */}
      {exVideos.length + newVideoFiles.length > 0 && (
        <div className='space-y-1'>
          <div className='text-xs text-gray-500'>Видео</div>
          <div className='flex overflow-x-auto gap-2 whitespace-nowrap scrollbar-hide py-1'>
            {exVideos.map(({ u, idx }) => {
              const src = resolveUrl(u);
              return (
                <DraggableVideoThumb
                  key={`ex-video-${idx}`}
                  src={src}
                  onRemove={
                    onRemoveExisting ? () => onRemoveExisting(idx) : undefined
                  }
                  enableDragAndDrop={enableDragAndDrop}
                  index={idx}
                  type='existing'
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e, index) => handleDrop(e, index, 'videos')}
                  onDragEnd={handleDragEnd}
                  isDragged={
                    draggedItem?.type === 'existing' &&
                    draggedItem.index === idx
                  }
                  isDragOver={dragOverIndex === idx}
                  itemType='videos'
                />
              );
            })}

            {localUrls
              .filter(o => o.isVideo)
              .map(({ idx, url }) => (
                <DraggableVideoThumb
                  key={`new-video-${idx}`}
                  src={url}
                  onRemove={() =>
                    onFilesChange(files.filter((_, i) => i !== idx))
                  }
                  enableDragAndDrop={enableDragAndDrop}
                  index={idx}
                  type='new'
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e, index) => handleDrop(e, index, 'videos')}
                  onDragEnd={handleDragEnd}
                  isDragged={
                    draggedItem?.type === 'new' && draggedItem.index === idx
                  }
                  isDragOver={dragOverIndex === idx}
                  itemType='videos'
                />
              ))}
          </div>
        </div>
      )}

      {showCount && (
        <div className='text-xs text-gray-600'>
          выбрано: {currentCount} / {maxFiles}
        </div>
      )}
      {error && <div className='text-xs text-red-600'>{error}</div>}
    </div>
  );
};

/* helpers UI */

function DraggableThumb({
  src,
  onRemove,
  isLocal = false,
  enableDragAndDrop = false,
  index,
  type,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragged = false,
  isDragOver = false,
  itemType,
}: {
  src: string;
  onRemove?: () => void;
  isLocal?: boolean;
  enableDragAndDrop?: boolean;
  index: number;
  type: 'existing' | 'new';
  onDragStart: (
    e: React.DragEvent,
    type: 'existing' | 'new',
    index: number,
  ) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (
    e: React.DragEvent,
    index: number,
    itemType: 'images' | 'videos' | 'docs',
  ) => void;
  onDragEnd: () => void;
  isDragged?: boolean;
  isDragOver?: boolean;
  itemType: 'images' | 'videos' | 'docs';
}) {
  return (
    <div
      draggable={enableDragAndDrop}
      onDragStart={e => onDragStart(e, type, index)}
      onDragOver={e => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, index, itemType)}
      onDragEnd={onDragEnd}
      className={cn(
        'relative shrink-0 w-20 h-20 bg-white rounded-xl overflow-hidden',
        enableDragAndDrop && 'cursor-grab active:cursor-grabbing',
        isDragged && 'opacity-50',
        isDragOver && 'ring-2 ring-blue-500 ring-opacity-50',
      )}
    >
      <Image src={src} alt='' fill unoptimized className='object-contain' />
      {onRemove && (
        <button
          type='button'
          onClick={onRemove}
          className='cursor-pointer absolute top-1.5 right-1.5 bg-white/85 rounded-full p-0.5'
          aria-label='Удалить файл'
          title='Убрать файл'
        >
          <X className='w-3 h-3' />
        </button>
      )}
      {enableDragAndDrop && (
        <div className='absolute bottom-1 left-1 bg-black/50 rounded p-0.5'>
          <GripVertical className='w-2 h-2 text-white' />
        </div>
      )}
    </div>
  );
}

function DraggableDocRow({
  label,
  href,
  onRemove,
  enableDragAndDrop = false,
  index,
  type,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragged = false,
  isDragOver = false,
  itemType,
}: {
  label: string;
  href?: string | File;
  onRemove?: () => void;
  enableDragAndDrop?: boolean;
  index: number;
  type: 'existing' | 'new';
  onDragStart: (
    e: React.DragEvent,
    type: 'existing' | 'new',
    index: number,
  ) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (
    e: React.DragEvent,
    index: number,
    itemType: 'images' | 'videos' | 'docs',
  ) => void;
  onDragEnd: () => void;
  isDragged?: boolean;
  isDragOver?: boolean;
  itemType: 'images' | 'videos' | 'docs';
}) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const content = (
    <div className='flex items-center gap-2 min-w-0'>
      {enableDragAndDrop && (
        <GripVertical className='w-3 h-3 text-gray-400 shrink-0' />
      )}
      <FileText className='w-4 h-4 shrink-0' />
      <span className={cn('truncate text-sm underline')}>{label}</span>
    </div>
  );

  return (
    <div
      draggable={enableDragAndDrop}
      onDragStart={e => onDragStart(e, type, index)}
      onDragOver={e => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, index, itemType)}
      onDragEnd={onDragEnd}
      className={cn(
        'flex items-center justify-between gap-3 bg-white rounded-md px-3 py-2',
        enableDragAndDrop && 'cursor-grab active:cursor-grabbing',
        isDragged && 'opacity-50',
        isDragOver && 'ring-2 ring-blue-500 ring-opacity-50',
      )}
    >
      {href ? (
        <>
          <button
            type='button'
            onClick={() => setPdfModalOpen(true)}
            className='min-w-0'
          >
            {content}
          </button>
          {href && (
            <PDFModal
              isOpen={pdfModalOpen}
              onClose={() => setPdfModalOpen(false)}
              file={href}
              title={'Документ'}
              loadPlaceholder='Открытие документа'
            />
          )}
        </>
      ) : (
        content
      )}
      {onRemove && (
        <button
          type='button'
          onClick={onRemove}
          className='p-1 rounded-full bg-white border shadow hover:opacity-80'
          aria-label='Удалить файл'
          title='Убрать файл'
        >
          <X className='w-3 h-3' />
        </button>
      )}
    </div>
  );
}

function DraggableVideoThumb({
  src,
  onRemove,
  enableDragAndDrop = false,
  index,
  type,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragged = false,
  isDragOver = false,
  itemType,
}: {
  src: string;
  onRemove?: () => void;
  enableDragAndDrop?: boolean;
  index: number;
  type: 'existing' | 'new';
  onDragStart: (
    e: React.DragEvent,
    type: 'existing' | 'new',
    index: number,
  ) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (
    e: React.DragEvent,
    index: number,
    itemType: 'images' | 'videos' | 'docs',
  ) => void;
  onDragEnd: () => void;
  isDragged?: boolean;
  isDragOver?: boolean;
  itemType: 'images' | 'videos' | 'docs';
}) {
  return (
    <div
      draggable={enableDragAndDrop}
      onDragStart={e => onDragStart(e, type, index)}
      onDragOver={e => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, index, itemType)}
      onDragEnd={onDragEnd}
      className={cn(
        'relative shrink-0 w-20 h-20 bg-white rounded-xl overflow-hidden',
        enableDragAndDrop && 'cursor-grab active:cursor-grabbing',
        isDragged && 'opacity-50',
        isDragOver && 'ring-2 ring-blue-500 ring-opacity-50',
      )}
    >
      <video
        src={src}
        className='w-full h-full object-cover'
        muted
        preload='metadata'
      />
      {onRemove && (
        <button
          type='button'
          onClick={onRemove}
          className='cursor-pointer absolute top-1.5 right-1.5 bg-white/85 rounded-full p-0.5'
          aria-label='Удалить файл'
          title='Убрать файл'
        >
          <X className='w-3 h-3' />
        </button>
      )}
      {enableDragAndDrop && (
        <div className='absolute bottom-1 left-1 bg-black/50 rounded p-0.5'>
          <GripVertical className='w-2 h-2 text-white' />
        </div>
      )}
    </div>
  );
}
