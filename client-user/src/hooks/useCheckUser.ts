import { createToken } from '@/api/auth/methods';
import { getTokens, saveTokens, clearTokens } from '@/api/auth/tokenStorage';
import { initData, useRawInitData, useSignal } from '@tma.js/sdk-react';
import { useEffect, useState } from 'react';
import { usePopup } from '@/hooks/usePopup';
import { isTokenExpired, isTokenForCurrentUser } from '@/utils/tokenUtils';
import { fetchUserIp } from '@/utils/ipify.service';

export function useCheckUser() {
  const [isCompleted, setIsCompleted] = useState(false);
  const initDataUser = useSignal(initData.user);
  const rawInitData = useRawInitData();

  const { showPopup } = usePopup();

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        // Проверка пользователя Telegram
        if (!initDataUser || !rawInitData) {
          showPopup({
            title: 'Ошибка авторизации',
            message: 'Вы можете использовать только Telegram!',
            buttons: [{ type: 'destructive', text: 'Закрыть' }],
          });
          if (isMounted) setIsCompleted(true);
          return;
        }

        const currentTgId = initDataUser.id.toString();

        // Получаем токены
        const tokens = getTokens();
        const userIp = await fetchUserIp();

        // Проверяем наличие и валидность токенов
        if (
          !tokens ||
          !tokens.accessToken ||
          isTokenExpired(tokens.accessToken) ||
          !isTokenForCurrentUser(tokens.accessToken, currentTgId)
        ) {
          // Очищаем токены если они не соответствуют текущему пользователю
          if (tokens) clearTokens();

          try {
            const newTokens = await createToken({
              initDataRaw: rawInitData,
              ip: userIp,
            });

            if (newTokens) {
              saveTokens(newTokens);
            } else if (isMounted) {
              showPopup({
                title: 'Ошибка',
                message: 'Произошла ошибка при проверке вашего аккаунта',
                buttons: [{ type: 'destructive', text: 'Закрыть' }],
              });
            }
          } catch (tokenError) {
            if (isMounted) {
              showPopup({
                title: 'Ошибка',
                message: 'Не удалось создать токены авторизации',
                buttons: [{ type: 'destructive', text: 'Закрыть' }],
              });
            }
          }
        }

        if (isMounted) setIsCompleted(true);
      } catch (error) {
        if (isMounted) {
          console.error('Ошибка при проверке пользователя:', error);
          showPopup({
            title: 'Ошибка',
            message: 'Произошла ошибка при проверке вашего аккаунта',
            buttons: [{ type: 'destructive', text: 'Закрыть' }],
          });
          setIsCompleted(true);
        }
      }
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, [initDataUser, rawInitData, showPopup]);

  return isCompleted;
}
