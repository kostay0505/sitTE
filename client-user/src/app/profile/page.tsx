'use client';

import { useEffect, useMemo, useState } from 'react';
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
  DoorClosed,
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
import { toImageSrc } from '@/utils/toImageSrc';
import { Link } from '@/components/Link/Link';
import { UserDataResponse } from '@/api/user/types';
import { TgConfirmModal } from '@/components/Auth/TgConfirmModal';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { clearTokens } from '@/api/auth/tokenStorage';
import { isTMA } from '@tma.js/bridge';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
  // 1) Реальные данные профиля
  const { data: me, status } = useUserData();
  const isLoading = status === 'pending';

  const initDataUser = useSignal(initData.user);

  const displayName = useMemo(() => {
    if (me) {
      const byName = [me.firstName, me.lastName].filter(Boolean).join(' ');
      return byName || me.username || 'Пользователь';
    }
    // fallback из Telegram initData
    return initDataUser?.first_name || initDataUser?.username || 'Пользователь';
  }, [me, initDataUser?.first_name, initDataUser?.username]);

  const displayHandle = useMemo(() => {
    if (me?.username) return `@${me.username}`;
    if (initDataUser?.username) return `@${initDataUser.username}`;
    return '@username';
  }, [me?.username, initDataUser?.username]);

  const avatarSrc = useMemo(() => {
    // порядок приоритета: серверный photoUrl → telegram → плейсхолдер
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
    setSubscribed(next); // оптимистично
    // Собираем тело запроса из текущих полей (EditUserDataRequest)
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
        onError: () => setSubscribed(prev => !next), // откат при ошибке
      },
    );
  };

  return (
    <ProtectedRoute>
      <Page back={true}>
        <Layout className='p-2 pt-4 space-y-5 text-black'>
          {/* 👤 Профиль пользователя */}
          <div className='flex items-center justify-between gap-4 md:bg-[#F5F5FA] md:p-4 md:rounded-xl'>
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

          {/* 📋 Пункты меню */}
          <Menu user={me} />

          {/* ✉️ Подписка на рассылку */}
          <div className='flex items-center justify-between border-t pt-4 mt-4'>
            <span className='text-sm font-medium'>Получать рассылку</span>
            <Switch
              checked={subscribed}
              onCheckedChange={onToggleSubscribed}
              disabled={isLoading || edit.isPending}
            />
          </div>
        </Layout>
      </Page>
    </ProtectedRoute>
  );
}

function Menu({ user }: { user: UserDataResponse | undefined }) {
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

      {
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
      }

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
            <div className='relative bg-white md:bg-[#F5F5FA] rounded-xl grid grid-cols-2 gap-4'>
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
      className={cn(
        'w-full bg-white rounded-xl p-2 flex items-center justify-between text-left text-base',
        'md:bg-[#F5F5FA] md:p-4',
      )}
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
      className={cn(
        'w-full bg-white rounded-xl p-2 flex items-center justify-between text-left text-base cursor-pointer',
        'md:bg-[#F5F5FA] md:p-4',
      )}
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
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600',
        'transition-colors cursor-pointer',
      )}
      title='Выйти'
    >
      <span className='text-sm font-medium'>Выйти</span>
    </button>
  );
}
