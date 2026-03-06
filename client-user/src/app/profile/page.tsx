'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import {
  UserIcon,
  Heart,
  ClipboardList,
  PlusSquare,
  Briefcase,
  FileText,
  Pencil,
  ChevronDown,
  Menu,
  Search,
} from 'lucide-react';
import { TgIcon2 } from '@/components/common/SvgIcon';
import { Switch } from '@/components/common/Switch/Switch';
import { ROUTES } from '@/config/routes';
import { motion, AnimatePresence } from 'framer-motion';
import { initData, useSignal } from '@tma.js/sdk-react';
import { Skeleton } from '@/components/common/Skeleton/Skeleton';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton/ImageWithSkeleton';
import { cn } from '@/utils/cn';

import { useUserData, useEditUser } from '@/features/users/hooks';
import { useMyProducts, useDeleteProduct } from '@/features/products/hooks';
import { toImageSrc } from '@/utils/toImageSrc';
import { Link } from '@/components/Link/Link';
import { UserDataResponse } from '@/api/user/types';
import { TgConfirmModal } from '@/components/Auth/TgConfirmModal';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { clearTokens } from '@/api/auth/tokenStorage';
import { isTMA } from '@tma.js/bridge';
import { useQueryClient } from '@tanstack/react-query';
import { ProductCard } from '@/components/Catalog/ProductCard';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/currency';
import type { ProductBasic, StatusType } from '@/api/products/types';

export default function ProfilePage() {
  const { data: me, status } = useUserData();
  const isLoading = status === 'pending';

  const initDataUser = useSignal(initData.user);

  const displayName = useMemo(() => {
    if (me) {
      const byName = [me.firstName, me.lastName].filter(Boolean).join(' ');
      return byName || me.username || 'Пользователь';
    }
    return initDataUser?.first_name || initDataUser?.username || 'Пользователь';
  }, [me, initDataUser?.first_name, initDataUser?.username]);

  const displayHandle = useMemo(() => {
    if (me?.username) return `@${me.username}`;
    if (initDataUser?.username) return `@${initDataUser.username}`;
    return '@username';
  }, [me?.username, initDataUser?.username]);

  const avatarSrc = useMemo(() => {
    return toImageSrc(me?.photoUrl ?? initDataUser?.photo_url ?? null);
  }, [me?.photoUrl, initDataUser?.photo_url]);

  const [subscribed, setSubscribed] = useState<boolean>(
    !!me?.subscribedToNewsletter,
  );
  useEffect(() => {
    if (typeof me?.subscribedToNewsletter === 'boolean') {
      setSubscribed(me.subscribedToNewsletter);
    }
  }, [me?.subscribedToNewsletter]);

  const edit = useEditUser();

  const onToggleSubscribed = (next: boolean) => {
    setSubscribed(next);
    edit.mutate(
      {
        firstName: me?.firstName ?? '',
        lastName: me?.lastName ?? null,
        email: me?.email ?? null,
        phone: me?.phone ?? null,
        cityId: me?.city?.id ?? null,
        subscribedToNewsletter: next,
      },
      {
        onError: () => setSubscribed(() => !next),
      },
    );
  };

  return (
    <ProtectedRoute>
      <Page back={true}>
        {/* Desktop layout */}
        <div className='hidden md:flex md:flex-col md:h-full md:text-black'>
          <DesktopProfile
            me={me}
            isLoading={isLoading}
            displayName={displayName}
            displayHandle={displayHandle}
            avatarSrc={avatarSrc}
            subscribed={subscribed}
            onToggleSubscribed={onToggleSubscribed}
            editPending={edit.isPending}
          />
        </div>

        {/* Mobile layout */}
        <div className='md:hidden'>
          <Layout className='p-2 pt-4 space-y-5 text-black'>
            <div className='flex items-center justify-between gap-4 bg-[#F5F5FA] p-4 rounded-xl'>
              <div className='flex items-center gap-4'>
                <div className='w-16 h-16 border rounded-lg flex items-center justify-center overflow-hidden'>
                  {isLoading ? (
                    <Skeleton width={'100%'} height={'100%'} />
                  ) : avatarSrc ? (
                    <ImageWithSkeleton
                      src={avatarSrc}
                      containerClassName='w-16 h-16'
                      className='!rounded-none object-cover'
                      alt='avatar'
                      isLoading={isLoading}
                    />
                  ) : (
                    <UserIcon className='w-10 h-10 text-gray-500' />
                  )}
                </div>
                <div className='space-y-1'>
                  {isLoading ? (
                    <>
                      <Skeleton height={28} />
                      <Skeleton height={24} />
                    </>
                  ) : (
                    <>
                      <div className='font-medium text-lg'>{displayName}</div>
                      <div className='text-gray-500'>{displayHandle}</div>
                    </>
                  )}
                </div>
              </div>
              {!isTMA() && <LogoutButton />}
            </div>

            <MobileMenu user={me} />

            <div className='flex items-center justify-between border-t pt-4 mt-4'>
              <span className='text-sm font-medium'>Получать рассылку</span>
              <Switch
                checked={subscribed}
                onCheckedChange={onToggleSubscribed}
                disabled={isLoading || edit.isPending}
              />
            </div>
          </Layout>
        </div>
      </Page>
    </ProtectedRoute>
  );
}

// ─────────────────────────────────────────────
// Desktop layout
// ─────────────────────────────────────────────

function DesktopProfile({
  me,
  isLoading,
  displayName,
  displayHandle,
  avatarSrc,
  subscribed,
  onToggleSubscribed,
  editPending,
}: {
  me: UserDataResponse | undefined;
  isLoading: boolean;
  displayName: string;
  displayHandle: string;
  avatarSrc: string | null;
  subscribed: boolean;
  onToggleSubscribed: (v: boolean) => void;
  editPending: boolean;
}) {
  const { data: products, status: productsStatus } = useMyProducts();
  const del = useDeleteProduct();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');

  const isProductsLoading = productsStatus === 'pending';
  const allItems = products ?? [];

  const filtered = useMemo(() => {
    return allItems.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allItems, search, statusFilter]);

  const handleDelete = (id: string) => {
    if (!id) return;
    if (confirm('Удалить объявление?')) {
      del.mutate(id, {
        onSuccess: () => toast.success('Объявление удалено'),
        onError: (e: any) =>
          toast.error(e?.message ?? 'Не удалось удалить объявление'),
      });
    }
  };

  const handlePosting = (product: ProductBasic) => {
    const message = `${product.name}\n\n${product.description}\n\n${formatPrice(product.priceCash, product.currency)}\n\n${product.url}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(product.url || '')}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  const statusLabels: Record<StatusType | 'all', string> = {
    all: 'Все',
    approved: 'Активные',
    moderation: 'На модерации',
    rejected: 'Отклонённые',
  };

  return (
    <div className='flex flex-col min-h-screen text-black'>
      {/* Top bar */}
      <div className='flex items-center justify-between gap-4 px-6 py-4 border-b bg-white'>
        {/* Left: dropdown menu */}
        <DesktopMenu user={me} />

        {/* Center: user info */}
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 border rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0'>
            {isLoading ? (
              <Skeleton width={40} height={40} />
            ) : avatarSrc ? (
              <ImageWithSkeleton
                src={avatarSrc}
                containerClassName='w-10 h-10'
                className='!rounded-none object-cover'
                alt='avatar'
                isLoading={isLoading}
              />
            ) : (
              <UserIcon className='w-6 h-6 text-gray-500' />
            )}
          </div>
          <div>
            {isLoading ? (
              <Skeleton width={120} height={20} />
            ) : (
              <>
                <div className='font-medium text-sm leading-tight'>{displayName}</div>
                <div className='text-gray-500 text-xs'>{displayHandle}</div>
              </>
            )}
          </div>
        </div>

        {/* Right: newsletter + logout */}
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-600'>Рассылка</span>
            <Switch
              checked={subscribed}
              onCheckedChange={onToggleSubscribed}
              disabled={isLoading || editPending}
            />
          </div>
          {!isTMA() && <LogoutButton />}
        </div>
      </div>

      {/* Search + filters */}
      <div className='flex items-center gap-3 px-6 py-4 border-b bg-[#F5F5FA]'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Поиск по названию...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-gray-400 transition'
          />
        </div>

        <div className='flex items-center gap-2'>
          {(Object.keys(statusLabels) as (StatusType | 'all')[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg border transition',
                statusFilter === s
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400',
              )}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className='flex-1 px-6 py-6'>
        {isProductsLoading && (
          <div className='grid grid-cols-4 gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCard key={i} isLoading />
            ))}
          </div>
        )}

        {!isProductsLoading && filtered.length === 0 && (
          <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
            <div className='text-5xl mb-4'>📦</div>
            <div className='text-lg'>
              {allItems.length === 0
                ? 'Объявлений пока нет'
                : 'Ничего не найдено'}
            </div>
          </div>
        )}

        {!isProductsLoading && filtered.length > 0 && (
          <div className='grid grid-cols-4 gap-4'>
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                hideFavorite
                showDelete
                onDelete={handleDelete}
                showPosting
                onPosting={handlePosting}
                href={`${ROUTES.EDIT_ADVERTISEMENT}/${product.id}`}
                showStatus
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Desktop dropdown menu
// ─────────────────────────────────────────────

function DesktopMenu({ user }: { user: UserDataResponse | undefined }) {
  const [open, setOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);
  const [tgConfirmOpen, setTgConfirmOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className='relative' ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className='flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-gray-400 transition text-sm font-medium'
      >
        <Menu className='w-4 h-4' />
        <span>Меню</span>
        <ChevronDown
          className={cn(
            'w-3 h-3 text-gray-400 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className='absolute left-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1'
          >
            <DropdownLink
              icon={<ClipboardList className='w-4 h-4' />}
              label='Личная информация'
              href={`${ROUTES.PROFILE}/info`}
              onClick={() => setOpen(false)}
            />
            <DropdownLink
              icon={<Heart className='w-4 h-4' />}
              label='Избранное'
              href={ROUTES.FAVORITES}
              onClick={() => setOpen(false)}
            />
            <DropdownLink
              icon={<PlusSquare className='w-4 h-4' />}
              label='Создать объявление'
              href={ROUTES.CREATE_ADVERTISEMENT}
              onClick={() => setOpen(false)}
            />

            {/* Работа accordion */}
            <button
              onClick={() => setJobOpen(prev => !prev)}
              className='w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition'
            >
              <span className='flex items-center gap-2'>
                <Briefcase className='w-4 h-4' />
                Работа
              </span>
              <ChevronDown
                className={cn(
                  'w-3 h-3 text-gray-400 transition-transform',
                  jobOpen && 'rotate-180',
                )}
              />
            </button>

            <AnimatePresence>
              {jobOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className='overflow-hidden bg-gray-50'
                >
                  <DropdownLink
                    icon={<FileText className='w-4 h-4' />}
                    label='Мои вакансии'
                    href={ROUTES.MY_VACANCY}
                    onClick={() => setOpen(false)}
                    indent
                  />
                  <DropdownLink
                    icon={<Pencil className='w-4 h-4' />}
                    label='Создать вакансию'
                    href={ROUTES.CREATE_VACANCY}
                    onClick={() => setOpen(false)}
                    indent
                  />
                  <DropdownLink
                    icon={<FileText className='w-4 h-4' />}
                    label='Мои резюме'
                    href={ROUTES.MY_RESUME}
                    onClick={() => setOpen(false)}
                    indent
                  />
                  <DropdownLink
                    icon={<Pencil className='w-4 h-4' />}
                    label='Создать резюме'
                    href={ROUTES.CREATE_RESUME}
                    onClick={() => setOpen(false)}
                    indent
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!user?.username && (
              <button
                onClick={() => {
                  setOpen(false);
                  setTgConfirmOpen(true);
                }}
                className='w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition'
              >
                <TgIcon2 className='w-4 h-4' />
                Привязать телеграм
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <TgConfirmModal
        open={tgConfirmOpen}
        onClose={() => setTgConfirmOpen(false)}
        value={user?.url ?? ''}
      />
    </div>
  );
}

function DropdownLink({
  icon,
  label,
  href,
  onClick,
  indent = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition',
        indent ? 'px-8' : 'px-4',
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

// ─────────────────────────────────────────────
// Mobile menu (existing behavior)
// ─────────────────────────────────────────────

function MobileMenu({ user }: { user: UserDataResponse | undefined }) {
  const [jobOpen, setJobOpen] = useState(false);
  const [tgConfirmOpen, setTgConfirmOpen] = useState(false);
  return (
    <div className='space-y-2'>
      <ProfileItem
        icon={<ClipboardList className='w-5 h-5' />}
        label='Личная информация'
        href={`${ROUTES.PROFILE}/info`}
      />
      <ProfileItem
        icon={<Heart className='w-5 h-5 fill-black' />}
        label='Избранное'
        href={ROUTES.FAVORITES}
      />
      <ProfileItem
        icon={<ClipboardList className='w-5 h-5' />}
        label='Мои объявления'
        href={ROUTES.MY_ADVERTISEMENTS}
      />
      <ProfileItem
        icon={<PlusSquare className='w-5 h-5' />}
        label='Создать объявление'
        href={ROUTES.CREATE_ADVERTISEMENT}
      />

      <ProfileItem
        icon={<Briefcase className='w-5 h-5' />}
        label='Работа'
        onClick={() => setJobOpen(prev => !prev)}
        rightIcon={
          <motion.div
            animate={{ rotate: jobOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className='w-4 h-4 text-gray-500' />
          </motion.div>
        }
      />

      <AnimatePresence>
        {jobOpen && (
          <motion.div
            key='job-section'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className='overflow-hidden'
          >
            <div className='relative bg-white rounded-xl grid grid-cols-2 gap-4'>
              <div className='absolute top-0 bottom-0 left-1/2 w-px bg-gray-200 z-0' />
              <div className='z-10 flex flex-col gap-4 p-4'>
                <SubItem
                  icon={<FileText className='w-5 h-5' />}
                  label='Мои вакансии'
                  href={ROUTES.MY_VACANCY}
                />
                <SubItem
                  icon={<Pencil className='w-5 h-5' />}
                  label='Создать вакансию'
                  href={ROUTES.CREATE_VACANCY}
                />
              </div>
              <div className='z-10 flex flex-col gap-4 p-4'>
                <SubItem
                  icon={<FileText className='w-5 h-5' />}
                  label='Мои резюме'
                  href={ROUTES.MY_RESUME}
                />
                <SubItem
                  icon={<Pencil className='w-5 h-5' />}
                  label='Создать резюме'
                  href={ROUTES.CREATE_RESUME}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!user?.username && (
        <ProfileItem
          icon={<TgIcon2 className='w-5 h-5' />}
          label='Привязать телеграм'
          onClick={() => setTgConfirmOpen(true)}
        />
      )}

      <TgConfirmModal
        open={tgConfirmOpen}
        onClose={() => setTgConfirmOpen(false)}
        value={user?.url ?? ''}
      />
    </div>
  );
}

function ProfileItem({
  icon,
  label,
  onClick,
  href,
  rightIcon,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
}) {
  return href ? (
    <Link
      href={disabled ? '' : href}
      onClick={onClick}
      className='w-full bg-white rounded-xl p-2 flex items-center justify-between text-left text-base'
    >
      <div className='flex items-center gap-3'>
        <span className='text-gray-800'>{icon}</span>
        <span>{label}</span>
      </div>
      {rightIcon}
    </Link>
  ) : (
    <button
      onClick={onClick}
      className='w-full bg-white rounded-xl p-2 flex items-center justify-between text-left text-base cursor-pointer'
    >
      <div className='flex items-center gap-3'>
        <span className='text-gray-800'>{icon}</span>
        <span>{label}</span>
      </div>
      {rightIcon}
    </button>
  );
}

function SubItem({
  icon,
  label,
  href,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Link
      href={disabled ? '' : href}
      onClick={onClick}
      className='flex flex-col items-start justify-center gap-1 text-sm text-black'
    >
      <div className='flex items-center gap-2'>
        {icon}
        <span className='text-left'>{label}</span>
      </div>
    </Link>
  );
}

function LogoutButton() {
  const router = useRouter();
  const setAuthorized = useAuthStore(s => s.setAuthorized);
  const queryClient = useQueryClient();

  const handleLogout = () => {
    setAuthorized(false);
    clearTokens();
    queryClient.clear();
    router.replace(ROUTES.HOME);
  };

  return (
    <button
      onClick={handleLogout}
      className='flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer'
      title='Выйти'
    >
      <span className='text-sm font-medium'>Выйти</span>
    </button>
  );
}
