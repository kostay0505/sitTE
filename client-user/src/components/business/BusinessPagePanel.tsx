'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, GripVertical, Pencil, Trash2, ChevronLeft,
  Type, ImageIcon, Store, Images, Phone, X, Eye, ExternalLink, BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { getMyBusinessPage, upsertBusinessPage } from '@/api/business-page/methods';
import { uploadFile } from '@/api/files/methods';
import { toImageSrc } from '@/utils/toImageSrc';
import { useCategoryFilterOptions } from '@/features/category/hooks';
import type {
  Block, BlockType, BusinessPage,
  PhotoLeftBlock, PhotoCarouselBlock, ContactsBlock, ShowcaseBlock, CatalogBlock,
} from '@/api/business-page/types';
import { BLOCK_TYPE_META as META } from '@/api/business-page/types';
import { BlockRenderer } from './BusinessPageView';
import { extractTgIdFromToken } from '@/utils/tokenUtils';
import { getTokens } from '@/api/auth/tokenStorage';

// ── helpers ───────────────────────────────────────────────────────────────────

function newBlock(type: BlockType): Block {
  const id = crypto.randomUUID();
  switch (type) {
    case 'text_banner':   return { id, type, title: '', text: '' };
    case 'photo_left':    return { id, type, title: '', text: '', photoUrl: '' };
    case 'photo_right':   return { id, type, title: '', text: '', photoUrl: '' };
    case 'showcase':      return { id, type, title: '', categoryId: null };
    case 'photo_carousel':return { id, type, title: '', items: [] };
    case 'contacts':      return { id, type, phone: '', email: '', address: '' };
    case 'catalog':       return { id, type, title: '', text: '', photoUrl: '', buttonText: 'Смотреть каталог' };
  }
}

const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  text_banner:    <Type className='w-4 h-4' />,
  photo_left:     <ImageIcon className='w-4 h-4' />,
  photo_right:    <ImageIcon className='w-4 h-4' />,
  showcase:       <Store className='w-4 h-4' />,
  photo_carousel: <Images className='w-4 h-4' />,
  contacts:       <Phone className='w-4 h-4' />,
  catalog:        <BookOpen className='w-4 h-4' />,
};

type View = 'list' | 'picker' | 'edit';

// ── Main component ────────────────────────────────────────────────────────────

export function BusinessPagePanel() {
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState<BusinessPage | null>(null);
  const [slug, setSlug] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [view, setView] = useState<View>('list');
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const tokens = getTokens();
    if (tokens?.accessToken) {
      const tgId = extractTgIdFromToken(tokens.accessToken);
      if (tgId) setUserId(tgId);
    }
    setIsLoading(true);
    getMyBusinessPage()
      .then(p => { if (p) { setPage(p); setSlug(p.slug); setBlocks(p.blocks ?? []); } })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSlugChange = (v: string) => {
    const clean = v.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setSlug(clean);
    if (clean.length > 0 && clean.length < 3) setSlugError('Минимум 3 символа');
    else setSlugError('');
  };

  const handleSave = async () => {
    if (!slug || slug.length < 3) { toast.error('Введите адрес страницы (минимум 3 символа)'); return; }
    setIsSaving(true);
    try {
      const saved = await upsertBusinessPage(slug, blocks);
      setPage(saved);
      toast.success('Страница сохранена');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const block = newBlock(type);
    setBlocks(prev => [...prev, block]);
    setEditingBlock(block);
    setView('edit');
  };

  const handleEditBlock = (block: Block) => {
    setEditingBlock({ ...block });
    setView('edit');
  };

  const handleSaveBlock = (updated: Block) => {
    setBlocks(prev => prev.map(b => (b.id === updated.id ? updated : b)));
    setEditingBlock(null);
    setView('list');
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (editingBlock?.id === id) { setEditingBlock(null); setView('list'); }
  };

  const reorder = useCallback((from: number, to: number) => {
    setBlocks(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }, []);

  const onDragStart = (i: number) => setDragIndex(i);
  const onDragOver = (i: number) => {
    setOverIndex(i);
    if (dragIndex !== null && dragIndex !== i) reorder(dragIndex, i);
    setDragIndex(i);
  };
  const onDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  return (
    <div className='flex gap-4 h-[calc(100vh-192px)] min-h-[500px]'>

      {/* ── Left: control panel ────────────────────────────── */}
      <div className='w-[280px] flex-shrink-0 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm'>

        {/* Header row */}
        <div className='flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0'>
          {view !== 'list' && (
            <button
              onClick={() => { setView('list'); setEditingBlock(null); }}
              className='p-1 rounded-lg hover:bg-gray-100 transition flex-shrink-0'
            >
              <ChevronLeft className='w-4 h-4 text-gray-500' />
            </button>
          )}
          <span className='text-sm font-semibold text-gray-800 flex-1 truncate'>
            {view === 'list' ? 'Редактор страницы'
              : view === 'picker' ? 'Добавить блок'
              : 'Редактировать блок'}
          </span>
        </div>

        {/* Slug + Save (list view only) */}
        {view === 'list' && (
          <div className='px-4 py-3 border-b border-gray-100 flex-shrink-0 space-y-2'>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>Адрес страницы</label>
              <div className='flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 transition'>
                <span className='px-2.5 py-2 text-xs text-gray-400 bg-gray-50 border-r border-gray-200 whitespace-nowrap'>/shop/</span>
                <input
                  type='text'
                  value={slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  placeholder='my-company'
                  className='flex-1 px-2.5 py-2 text-xs outline-none bg-white min-w-0'
                />
              </div>
              {slugError && <p className='text-xs text-red-500 mt-1'>{slugError}</p>}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className='w-full py-2 bg-gray-900 text-white text-xs font-medium rounded-xl hover:bg-gray-700 disabled:opacity-50 transition'
            >
              {isSaving ? 'Сохранение...' : 'Сохранить страницу'}
            </button>
          </div>
        )}

        {/* Scrollable view content */}
        <div className='flex-1 overflow-y-auto'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin' />
            </div>
          ) : view === 'list' ? (
            <BlockListPanel
              blocks={blocks}
              onEditBlock={handleEditBlock}
              onDeleteBlock={handleDeleteBlock}
              dragIndex={dragIndex}
              overIndex={overIndex}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
            />
          ) : view === 'picker' ? (
            <BlockPicker onSelect={handleAddBlock} />
          ) : editingBlock ? (
            <BlockEditForm
              block={editingBlock}
              onSave={handleSaveBlock}
              onCancel={() => { setView('list'); setEditingBlock(null); }}
            />
          ) : null}
        </div>

        {/* Add block button — list view footer */}
        {view === 'list' && !isLoading && (
          <div className='px-4 py-3 border-t border-gray-100 flex-shrink-0'>
            <button
              onClick={() => setView('picker')}
              className='w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition'
            >
              <Plus className='w-4 h-4' />
              Добавить блок
            </button>
          </div>
        )}
      </div>

      {/* ── Right: preview ─────────────────────────────────── */}
      <div className='flex-1 overflow-hidden flex flex-col rounded-2xl border border-gray-200 shadow-sm bg-white'>

        {/* Preview header */}
        <div className='flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50 rounded-t-2xl text-xs text-gray-500'>
          <Eye className='w-3.5 h-3.5' />
          <span className='font-medium'>Предпросмотр</span>
          {page?.slug && (
            <>
              <span className='mx-1 text-gray-300'>·</span>
              <a
                href={`/shop/${page.slug}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:underline flex items-center gap-1'
              >
                /shop/{page.slug}
                <ExternalLink className='w-3 h-3' />
              </a>
            </>
          )}
        </div>

        {/* Scrollable preview content */}
        <div className='flex-1 overflow-y-auto'>
          {isLoading ? null : blocks.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full py-24 text-gray-400'>
              <Store className='w-14 h-14 mb-4 opacity-15' />
              <p className='text-sm font-medium mb-1'>Страница пока пустая</p>
              <p className='text-xs text-gray-400 mb-4'>Добавьте блоки, чтобы заполнить её</p>
              <button
                onClick={() => setView('picker')}
                className='px-4 py-2 bg-gray-900 text-white text-xs rounded-xl hover:bg-gray-700 transition'
              >
                + Добавить блок
              </button>
            </div>
          ) : (
            <div>
              {blocks.map((block, i) => (
                <PreviewBlock
                  key={block.id}
                  block={block}
                  userId={userId}
                  slug={page?.slug}
                  isEditing={editingBlock?.id === block.id}
                  onEdit={() => handleEditBlock(block)}
                  onDelete={() => handleDeleteBlock(block.id)}
                />
              ))}
              {/* Add block at bottom of preview */}
              <div className='py-6 flex justify-center border-t border-gray-100'>
                <button
                  onClick={() => setView('picker')}
                  className='flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 transition'
                >
                  <Plus className='w-4 h-4' />
                  Добавить блок
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Preview block wrapper ─────────────────────────────────────────────────────

function PreviewBlock({
  block, userId, slug, isEditing, onEdit, onDelete,
}: {
  block: Block;
  userId: string;
  slug?: string;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        'relative group border-2 transition-colors',
        isEditing ? 'border-blue-400' : 'border-transparent hover:border-gray-300',
      )}
    >
      {/* Actual block content */}
      <BlockRenderer block={block} sellerId={userId} slug={slug} />

      {/* Hover tint */}
      <div className='absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/5 transition' />

      {/* Action buttons — top-right */}
      <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20'>
        <button
          onClick={onEdit}
          className='flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-md border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 transition'
        >
          <Pencil className='w-3.5 h-3.5' />
          Изменить
        </button>
        <button
          onClick={onDelete}
          className='p-1.5 bg-white rounded-lg shadow-md border border-gray-200 text-red-500 hover:bg-red-50 transition'
        >
          <Trash2 className='w-4 h-4' />
        </button>
      </div>

      {/* Type label — top-left */}
      <div className='absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20'>
        <div className='flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-md border border-gray-200 text-xs text-gray-500'>
          {BLOCK_ICONS[block.type]}
          <span>{META[block.type].label}</span>
        </div>
      </div>
    </div>
  );
}

// ── Block list panel (left) ───────────────────────────────────────────────────

function BlockListPanel({
  blocks, onEditBlock, onDeleteBlock,
  dragIndex, overIndex, onDragStart, onDragOver, onDragEnd,
}: {
  blocks: Block[];
  onEditBlock: (b: Block) => void;
  onDeleteBlock: (id: string) => void;
  dragIndex: number | null;
  overIndex: number | null;
  onDragStart: (i: number) => void;
  onDragOver: (i: number) => void;
  onDragEnd: () => void;
}) {
  if (blocks.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-gray-400 text-xs text-center px-4'>
        Блоков пока нет — нажмите «Добавить блок» ниже
      </div>
    );
  }

  return (
    <div className='p-3 space-y-1.5'>
      {blocks.map((block, i) => (
        <div
          key={block.id}
          draggable
          onDragStart={() => onDragStart(i)}
          onDragOver={e => { e.preventDefault(); onDragOver(i); }}
          onDragEnd={onDragEnd}
          className={cn(
            'flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 transition cursor-grab active:cursor-grabbing',
            dragIndex === i && 'opacity-40',
            overIndex === i && dragIndex !== i && 'border-gray-900 bg-gray-100',
          )}
        >
          <GripVertical className='w-4 h-4 text-gray-400 flex-shrink-0' />
          <div className='text-gray-400 flex-shrink-0'>{BLOCK_ICONS[block.type]}</div>
          <div className='flex-1 min-w-0'>
            <p className='text-xs font-medium text-gray-800 truncate'>{META[block.type].label}</p>
            {(block as any).title && (
              <p className='text-xs text-gray-400 truncate'>{(block as any).title}</p>
            )}
          </div>
          <button onClick={() => onEditBlock(block)} className='p-1 rounded hover:bg-white transition flex-shrink-0'>
            <Pencil className='w-3.5 h-3.5 text-gray-400' />
          </button>
          <button onClick={() => onDeleteBlock(block.id)} className='p-1 rounded hover:bg-white transition flex-shrink-0'>
            <Trash2 className='w-3.5 h-3.5 text-red-400' />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Block picker ──────────────────────────────────────────────────────────────

function BlockPicker({ onSelect }: { onSelect: (type: BlockType) => void }) {
  const types: BlockType[] = ['text_banner', 'photo_left', 'photo_right', 'showcase', 'photo_carousel', 'contacts', 'catalog'];
  return (
    <div className='p-4 space-y-2'>
      {types.map(type => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className='w-full flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-white transition text-left'
        >
          <div className='text-gray-500 flex-shrink-0'>{BLOCK_ICONS[type]}</div>
          <div>
            <p className='text-xs font-semibold text-gray-800'>{META[type].label}</p>
            <p className='text-xs text-gray-400 mt-0.5'>{META[type].description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Block edit form ───────────────────────────────────────────────────────────

function BlockEditForm({
  block, onSave, onCancel,
}: {
  block: Block;
  onSave: (b: Block) => void;
  onCancel: () => void;
}) {
  const [local, setLocal] = useState<Block>({ ...block });
  const { all: categories } = useCategoryFilterOptions();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: any) => setLocal(prev => ({ ...prev, [key]: value } as any));

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { filename } = await uploadFile(fd);
      set('photoUrl', filename);
    } catch {
      toast.error('Ошибка загрузки фото');
    } finally {
      setUploading(false);
    }
  };

  const handleCarouselUpload = async (files: FileList) => {
    const carousel = local as PhotoCarouselBlock;
    if (carousel.items.length + files.length > 12) { toast.error('Максимум 12 элементов'); return; }
    setUploading(true);
    try {
      const VIDEO_EXT = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
      const newItems: PhotoCarouselBlock['items'] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const { filename } = await uploadFile(fd);
        newItems.push({ url: filename, mediaType: VIDEO_EXT.test(file.name) ? 'video' : 'image' });
      }
      set('items', [...carousel.items, ...newItems]);
    } catch {
      toast.error('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const removeCarouselItem = (idx: number) => {
    set('items', (local as PhotoCarouselBlock).items.filter((_, i) => i !== idx));
  };

  return (
    <div className='p-4 space-y-4'>
      <p className='text-xs font-medium text-gray-500'>{META[block.type].label}</p>

      {block.type !== 'contacts' && (
        <Field label='Заголовок'>
          <input
            type='text'
            value={(local as any).title ?? ''}
            onChange={e => set('title', e.target.value)}
            placeholder='Введите заголовок...'
            className='w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition'
          />
        </Field>
      )}

      {block.type === 'catalog' && (
        <>
          <Field label='Текст'>
            <textarea
              value={(local as CatalogBlock).text ?? ''}
              onChange={e => set('text', e.target.value)}
              placeholder='Описание каталога...'
              rows={3}
              className='w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition resize-none'
            />
          </Field>
          <Field label='Текст кнопки'>
            <input
              type='text'
              value={(local as CatalogBlock).buttonText ?? ''}
              onChange={e => set('buttonText', e.target.value)}
              placeholder='Смотреть каталог'
              className='w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition'
            />
          </Field>
          <Field label='Фотография (справа)'>
            <input ref={fileRef} type='file' accept='image/*' className='hidden'
              onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
            {(local as CatalogBlock).photoUrl ? (
              <div className='relative inline-block'>
                <img src={toImageSrc((local as CatalogBlock).photoUrl)} alt='' className='h-28 w-auto rounded-xl object-cover border border-gray-200' />
                <button onClick={() => set('photoUrl', '')} className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center'>
                  <X className='w-3 h-3' />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className='w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 transition text-xs'
              >
                <ImageIcon className='w-5 h-5' />
                {uploading ? 'Загрузка...' : 'Нажмите для загрузки фото'}
              </button>
            )}
          </Field>
        </>
      )}

      {(block.type === 'text_banner' || block.type === 'photo_left' || block.type === 'photo_right') && (
        <Field label='Текст'>
          <textarea
            value={(local as any).text ?? ''}
            onChange={e => set('text', e.target.value)}
            placeholder='Введите текст...'
            rows={4}
            className='w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition resize-none'
          />
        </Field>
      )}

      {(block.type === 'photo_left' || block.type === 'photo_right') && (
        <Field label='Фотография'>
          <input ref={fileRef} type='file' accept='image/*' className='hidden'
            onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
          {(local as PhotoLeftBlock).photoUrl ? (
            <div className='relative inline-block'>
              <img src={toImageSrc((local as PhotoLeftBlock).photoUrl)} alt='' className='h-28 w-auto rounded-xl object-cover border border-gray-200' />
              <button onClick={() => set('photoUrl', '')} className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center'>
                <X className='w-3 h-3' />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className='w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 transition text-xs'
            >
              <ImageIcon className='w-5 h-5' />
              {uploading ? 'Загрузка...' : 'Нажмите для загрузки фото'}
            </button>
          )}
        </Field>
      )}

      {block.type === 'showcase' && (
        <Field label='Категория (пусто — все товары)'>
          <select
            value={(local as ShowcaseBlock).categoryId ?? ''}
            onChange={e => set('categoryId', e.target.value || null)}
            className='w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition bg-white'
          >
            <option value=''>Все товары</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.parentId ? `  └ ${c.name}` : c.name}</option>
            ))}
          </select>
        </Field>
      )}

      {block.type === 'photo_carousel' && (
        <Field label={`Медиафайлы (${(local as PhotoCarouselBlock).items.length}/12)`}>
          <input ref={carouselRef} type='file' accept='image/*,video/*' multiple className='hidden'
            onChange={e => e.target.files && handleCarouselUpload(e.target.files)} />
          <div className='grid grid-cols-3 gap-2'>
            {(local as PhotoCarouselBlock).items.map((item, idx) => (
              <div key={idx} className='relative aspect-square bg-gray-100 rounded-lg overflow-hidden'>
                {item.mediaType === 'video'
                  ? <video src={toImageSrc(item.url)} className='w-full h-full object-cover' />
                  : <img src={toImageSrc(item.url)} alt='' className='w-full h-full object-cover' />}
                <button
                  onClick={() => removeCarouselItem(idx)}
                  className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center'
                >
                  <X className='w-3 h-3' />
                </button>
              </div>
            ))}
            {(local as PhotoCarouselBlock).items.length < 12 && (
              <button
                onClick={() => carouselRef.current?.click()}
                disabled={uploading}
                className='aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 transition'
              >
                {uploading
                  ? <div className='w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin' />
                  : <Plus className='w-5 h-5' />}
              </button>
            )}
          </div>
        </Field>
      )}

      {block.type === 'contacts' && (
        <>
          <Field label='Телефон'>
            <input type='tel' value={(local as ContactsBlock).phone} onChange={e => set('phone', e.target.value)}
              placeholder='+7 (999) 000-00-00'
              className='w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition' />
          </Field>
          <Field label='Email'>
            <input type='email' value={(local as ContactsBlock).email} onChange={e => set('email', e.target.value)}
              placeholder='info@company.ru'
              className='w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition' />
          </Field>
          <Field label='Адрес'>
            <input type='text' value={(local as ContactsBlock).address} onChange={e => set('address', e.target.value)}
              placeholder='г. Москва, ул. Примерная, 1'
              className='w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition' />
          </Field>
        </>
      )}

      <div className='flex gap-2 pt-1'>
        <button
          onClick={onCancel}
          className='flex-1 py-2 text-xs border border-gray-200 rounded-xl hover:bg-gray-50 transition'
        >
          Отмена
        </button>
        <button
          onClick={() => onSave(local)}
          className='flex-1 py-2 text-xs bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition'
        >
          Готово
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='space-y-1'>
      <label className='block text-xs font-medium text-gray-500'>{label}</label>
      {children}
    </div>
  );
}
