'use client';

import { useState, useEffect } from 'react';
import { getAllAccounts, deleteAccount, createAccount, updateAccount, checkLoginExists } from '@/api/accounts/methods';
import { Account } from '@/api/accounts/models';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/FormField/FormField';
import { SPACING } from '@/constants/ui';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/ui/Notification/Notification';
import { AdminForm, FormField } from '@/components/AdminForm/AdminForm';
import { AdminTable } from '@/components/AdminTable/AdminTable';
import { TableColumn, LoadingState } from '@/types/common';

const ACCOUNT_FORM_FIELDS: FormField[] = [
    {
        name: 'login',
        label: 'Логин',
        type: 'text',
        required: true,
        placeholder: 'Введите логин'
    },
    {
        name: 'password',
        label: 'Пароль',
        type: 'text',
        required: false,
        placeholder: 'Введите пароль',
        helpText: 'Оставьте пустым, если не хотите менять пароль'
    }
];

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    // Поиск
    const [search, setSearch] = useState('');

    // Модальные окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { notification, showNotification } = useNotification();

    // Загрузка данных
    const loadAccounts = async () => {
        try {
            setLoadingState({ isLoading: true, error: null });
            const response = await getAllAccounts(1, 1000, search || undefined);
            setAccounts(response.accounts);
        } catch (err: any) {
            const errorMessage = err.message || 'Не удалось загрузить аккаунты';
            setLoadingState({ isLoading: false, error: errorMessage });
            showNotification({
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setLoadingState({ isLoading: false, error: null });
        }
    };

    useEffect(() => {
        loadAccounts();
    }, [search]);

    // Обработчики
    const handleCreate = () => {
        setEditingAccount(null);
        setIsModalOpen(true);
    };

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
        setIsModalOpen(true);
    };

    const handleDelete = async (account: Account) => {
        if (!window.confirm(`Удалить аккаунт "${account.login}"?`)) {
            return;
        }

        try {
            await deleteAccount(account.id);
            await loadAccounts();
            showNotification({
                message: 'Аккаунт успешно удален',
                type: 'success'
            });
        } catch (err: any) {
            const errorMessage = err.message || 'Не удалось удалить аккаунт';
            showNotification({
                message: errorMessage,
                type: 'error'
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAccount(null);
    };

    const handleSaveAccount = async (accountData: any) => {
        setIsSubmitting(true);

        try {
            // Проверяем уникальность логина только при создании или изменении логина
            if (!editingAccount || (editingAccount && accountData.login !== editingAccount.login)) {
                const exists = await checkLoginExists(accountData.login.trim());
                if (exists) {
                    throw new Error('Аккаунт с таким логином уже существует');
                }
            }

            if (editingAccount) {
                const updateData: any = { login: accountData.login.trim() };
                if (accountData.password && accountData.password.trim()) {
                    updateData.password = accountData.password.trim();
                }
                await updateAccount(editingAccount.id, updateData);
                showNotification({
                    message: 'Аккаунт успешно обновлен',
                    type: 'success'
                });
            } else {
                await createAccount({
                    login: accountData.login.trim(),
                    password: accountData.password.trim()
                });
                showNotification({
                    message: 'Аккаунт успешно создан',
                    type: 'success'
                });
            }

            await loadAccounts();
            closeModal();
        } catch (err: any) {
            showNotification({
                message: err.message || 'Произошла ошибка',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Подготовка данных для формы
    const getFormInitialData = () => {
        if (!editingAccount) {
            return {
                login: '',
                password: ''
            };
        }

        return {
            login: editingAccount.login,
            password: ''
        };
    };

    // Колонки таблицы
    const columns: TableColumn<Account>[] = [
        {
            key: 'login',
            title: 'Логин',
            width: '300px'
        },
        {
            key: 'createdAt',
            title: 'Дата создания',
            width: '200px',
            render: (value) => new Date(value).toLocaleDateString('ru-RU')
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '200px',
            render: (value, item) => (
                <div style={{
                    display: 'flex',
                    gap: SPACING.SM,
                    justifyContent: 'flex-end'
                }}>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(item)}
                    >
                        Редактировать
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(item)}
                    >
                        Удалить
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            {/* Поиск */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.XL
            }}>
                <Input
                    name="search"
                    placeholder="Поиск по логину..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '300px' }}
                />
            </div>

            <AdminTable<Account>
                title="Управление аккаунтами"
                data={accounts}
                columns={columns}
                loadingState={loadingState}
                entityName="аккаунтов"
                emptyMessage={search ? 'Аккаунты не найдены' : 'Нет аккаунтов'}
                onRefresh={loadAccounts}
                onCreateNew={handleCreate}
                createButtonText="Создать аккаунт"
                itemsPerPage={10}
            />

            {/* Модальное окно с формой */}
            <AdminForm
                title={editingAccount ? 'Редактировать аккаунт' : 'Создать аккаунт'}
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSaveAccount}
                fields={ACCOUNT_FORM_FIELDS}
                initialData={getFormInitialData()}
                isSubmitting={isSubmitting}
                submitButtonText={editingAccount ? 'Сохранить' : 'Создать'}
            />

            {/* Уведомления */}
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