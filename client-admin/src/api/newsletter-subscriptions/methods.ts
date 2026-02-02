import { api } from '@/api/api';
import { NewsletterSubscription } from './models';

export async function getAllNewsletterSubscriptions(): Promise<
	NewsletterSubscription[]
> {
	try {
		const response = await api.get<NewsletterSubscription[]>(
			'/newsletter-subscriptions'
		);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data?.message) {
			throw new Error(error.response.data.message);
		}
		throw new Error('Не удалось загрузить подписки');
	}
}

export async function toggleNewsletterSubscriptionStatus(
	email: string
): Promise<NewsletterSubscription> {
	try {
		const response = await api.put<NewsletterSubscription>(
			`/newsletter-subscriptions/${encodeURIComponent(email)}/toggle-status`
		);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data?.message) {
			throw new Error(error.response.data.message);
		}
		throw new Error('Не удалось изменить статус подписки');
	}
}

export async function deleteNewsletterSubscription(
	email: string
): Promise<NewsletterSubscription> {
	try {
		const response = await api.delete<NewsletterSubscription>(
			`/newsletter-subscriptions/${encodeURIComponent(email)}`
		);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data?.message) {
			throw new Error(error.response.data.message);
		}
		throw new Error('Не удалось удалить подписку');
	}
}
