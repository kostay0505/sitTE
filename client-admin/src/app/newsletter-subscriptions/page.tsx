'use client';

import { useState, useEffect, useMemo } from 'react';
import {
	getAllNewsletterSubscriptions,
	toggleNewsletterSubscriptionStatus,
	deleteNewsletterSubscription,
} from '@/api/newsletter-subscriptions/methods';
import { NewsletterSubscription } from '@/api/newsletter-subscriptions/models';
import { Button } from '@/components/ui/Button/Button';
import { COLORS, SPACING } from '@/constants/ui';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/ui/Notification/Notification';
import { usePageTitle } from '@/components/AuthWrapper';
import { AdminTable } from '@/components/AdminTable/AdminTable';
import { TableColumn, LoadingState } from '@/types/common';
import { SearchableSelect } from '@/components/ui/SearchableSelect/SearchableSelect';

export default function NewsletterSubscriptionsPage() {
	const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>(
		[]
	);
	const [loadingState, setLoadingState] = useState<LoadingState>({
		isLoading: true,
		error: null,
	});
	const [selectedStatus, setSelectedStatus] = useState<string>('');

	const { notification, showNotification } = useNotification();
	const { setPageTitle } = usePageTitle();

	useEffect(() => {
		setPageTitle('Управление подписками на рассылку');
	}, [setPageTitle]);

	const loadSubscriptions = async () => {
		try {
			setLoadingState({ isLoading: true, error: null });
			const response = await getAllNewsletterSubscriptions();
			setSubscriptions(
				response.map((s) => ({
					...s,
					isActive: Boolean(s.isActive),
					isDelete: Boolean(s.isDelete),
				}))
			);
		} catch (err: any) {
			const errorMessage = err.message || 'Не удалось загрузить подписки';
			setLoadingState({ isLoading: false, error: errorMessage });
			showNotification({
				message: errorMessage,
				type: 'error',
			});
		} finally {
			setLoadingState({ isLoading: false, error: null });
		}
	};

	useEffect(() => {
		loadSubscriptions();
	}, []);

	const handleToggleStatus = async (subscription: NewsletterSubscription) => {
		try {
			const updated = await toggleNewsletterSubscriptionStatus(
				subscription.email
			);
			setSubscriptions((prev) =>
				prev.map((s) =>
					s.email === subscription.email
						? { ...s, isActive: updated.isActive }
						: s
				)
			);
			showNotification({
				message: subscription.isActive
					? 'Подписка деактивирована'
					: 'Подписка активирована',
				type: 'success',
			});
		} catch (err: any) {
			showNotification({
				message: err.message || 'Произошла ошибка',
				type: 'error',
			});
		}
	};

	const handleDelete = async (subscription: NewsletterSubscription) => {
		try {
			await deleteNewsletterSubscription(subscription.email);
			setSubscriptions((prev) =>
				prev.filter((s) => s.email !== subscription.email)
			);
			showNotification({
				message: 'Подписка удалена',
				type: 'success',
			});
		} catch (err: any) {
			showNotification({
				message: err.message || 'Произошла ошибка',
				type: 'error',
			});
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			showNotification({
				message: 'Email скопирован',
				type: 'success',
			});
		} catch (err) {
			showNotification({
				message: 'Ошибка копирования',
				type: 'error',
			});
		}
	};

	const filteredSubscriptions = useMemo(() => {
		let filtered = subscriptions.filter((s) => !s.isDelete);

		if (!selectedStatus || selectedStatus === '') {
			return filtered;
		}
		if (selectedStatus === 'active') {
			return filtered.filter((s) => Boolean(s.isActive) === true);
		}
		if (selectedStatus === 'inactive') {
			return filtered.filter((s) => Boolean(s.isActive) === false);
		}
		return filtered;
	}, [subscriptions, selectedStatus]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const columns: TableColumn<NewsletterSubscription>[] = [
		{
			key: 'email',
			title: 'Email',
			width: '300px',
			render: (value) => (
				<span
					onClick={() => copyToClipboard(value)}
					style={{
						cursor: 'pointer',
						padding: '4px 8px',
						borderRadius: '4px',
						border: `1px solid ${COLORS.GRAY[300]}`,
						display: 'inline-block',
						transition: 'background-color 0.2s ease',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = COLORS.GRAY[100];
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = 'transparent';
					}}
				>
					{value}
				</span>
			),
		},
		{
			key: 'isActive',
			title: 'Статус',
			width: '150px',
			render: (value) => (
				<span
					style={{
						color: value ? COLORS.SUCCESS.DARK : COLORS.ERROR.DARK,
					}}
				>
					{value ? 'Активна' : 'Неактивна'}
				</span>
			),
		},
		{
			key: 'createdAt',
			title: 'Дата подписки',
			width: '200px',
			render: (value) => formatDate(value),
		},
		{
			key: 'actions',
			title: 'Действия',
			width: '250px',
			render: (value, item) => (
				<div
					style={{
						display: 'flex',
						gap: SPACING.SM,
						justifyContent: 'flex-end',
					}}
				>
					<Button
						variant={item.isActive ? 'danger' : 'primary'}
						size="sm"
						onClick={() => handleToggleStatus(item)}
					>
						{item.isActive ? 'Деактивировать' : 'Активировать'}
					</Button>
					<Button variant="danger" size="sm" onClick={() => handleDelete(item)}>
						Удалить
					</Button>
				</div>
			),
		},
	];

	const filterContainerStyle = {
		display: 'flex',
		alignItems: 'center',
		gap: SPACING.MD,
		marginBottom: SPACING.XL,
		padding: SPACING.LG,
		backgroundColor: COLORS.GRAY[50],
		borderRadius: '8px',
		border: `1px solid ${COLORS.GRAY[200]}`,
	};

	const labelStyle = {
		fontSize: '12px',
		fontWeight: '500',
		color: COLORS.GRAY[700],
		marginBottom: '4px',
	};

	const selectStyle = {
		padding: `${SPACING.SM} ${SPACING.MD}`,
		border: `1px solid ${COLORS.GRAY[300]}`,
		borderRadius: '4px',
		fontSize: '14px',
		backgroundColor: COLORS.WHITE,
		outline: 'none',
		transition: 'border-color 0.2s ease',
		minWidth: '200px',
	};

	return (
		<>
			<div style={filterContainerStyle}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: SPACING.SM,
						minWidth: '200px',
					}}
				>
					<label style={labelStyle}>Статус</label>
					<SearchableSelect
						value={selectedStatus}
						onChange={setSelectedStatus}
						options={[
							{ value: '', label: 'Все подписки' },
							{ value: 'active', label: 'Активные' },
							{ value: 'inactive', label: 'Неактивные' },
						]}
						placeholder="Выберите статус"
						style={selectStyle}
					/>
				</div>
				{selectedStatus && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setSelectedStatus('')}
						style={{ padding: '4px 8px', fontSize: '12px' }}
					>
						Сбросить фильтр
					</Button>
				)}
			</div>

			<AdminTable<NewsletterSubscription & { id: string }>
				title="Управление подписками на рассылку"
				data={filteredSubscriptions.map((s) => ({ ...s, id: s.email }))}
				columns={columns}
				loadingState={loadingState}
				entityName="подписок"
				emptyMessage="Нет подписок"
				onRefresh={loadSubscriptions}
				itemsPerPage={20}
			/>

			{notification && (
				<Notification
					message={notification.message}
					type={notification.type}
					onClose={notification.onClose}
				/>
			)}
		</>
	);
}
