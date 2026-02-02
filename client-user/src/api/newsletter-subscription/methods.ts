import { api } from '@/api/api';
import {
  SubscribeNewsletterDto,
  SubscribeNewsletterResponse,
} from './types';
import { pickErrorMessage } from '@/utils/request';

export async function subscribeNewsletter(
  dto: SubscribeNewsletterDto,
): Promise<SubscribeNewsletterResponse> {
  try {
    const response = await api.post<SubscribeNewsletterResponse>(
      `/newsletter-subscriptions`,
      dto,
    );
    return response.data;
  } catch (error) {
    const message = pickErrorMessage(
      error,
      'Не удалось подписаться на рассылку',
    );
    throw new Error(message);
  }
}

