'use client';

import { useState, useEffect } from 'react';
import { getAllCountries, createCountry, updateCountry } from '@/api/countries/methods';
import { Country } from '@/api/countries/models';
import { Button } from '@/components/ui/Button/Button';
import { COLORS } from '@/constants/ui';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/ui/Notification/Notification';
import { AdminForm, FormField } from '@/components/AdminForm/AdminForm';
import { usePageTitle } from '@/components/AuthWrapper';
import { AdminTable } from '@/components/AdminTable/AdminTable';
import { TableColumn, LoadingState } from '@/types/common';

const COUNTRY_FORM_FIELDS: FormField[] = [
    {
        name: 'name',
        label: 'Название',
        type: 'text',
        required: true,
        placeholder: 'Введите название страны'
    },
    {
        name: 'isActive',
        label: 'Активна',
        type: 'checkbox',
        required: false
    }
];

export default function CountriesPage() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    // Модальные окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] = useState<Country | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { notification, showNotification } = useNotification();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Управление странами');
    }, [setPageTitle]);

    // Загрузка данных
    const loadCountries = async () => {
        try {
            setLoadingState({ isLoading: true, error: null });
            const response = await getAllCountries();
            setCountries(response);
        } catch (err: any) {
            const errorMessage = err.message || 'Не удалось загрузить страны';
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
        loadCountries();
    }, []);

    // Обработчики
    const handleCreate = () => {
        setEditingCountry(null);
        setIsModalOpen(true);
    };

    const handleEdit = (country: Country) => {
        setEditingCountry(country);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCountry(null);
    };

    const handleSaveCountry = async (countryData: any) => {
        setIsSubmitting(true);

        try {
            if (editingCountry) {
                await updateCountry(editingCountry.id, countryData);
                showNotification({
                    message: 'Страна успешно обновлена',
                    type: 'success'
                });
            } else {
                await createCountry(countryData);
                showNotification({
                    message: 'Страна успешно создана',
                    type: 'success'
                });
            }

            await loadCountries();
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
        if (!editingCountry) {
            return {
                name: '',
                isActive: true
            };
        }

        return {
            name: editingCountry.name,
            isActive: Boolean(editingCountry.isActive)
        };
    };

    // Колонки таблицы
    const columns: TableColumn<Country>[] = [
        {
            key: 'name',
            title: 'Название',
            width: '300px'
        },
        {
            key: 'isActive',
            title: 'Статус',
            width: '120px',
            render: (value) => (
                <span style={{
                    color: value ? COLORS.SUCCESS.DARK : COLORS.ERROR.DARK
                }}>
                    {value ? 'Активна' : 'Неактивна'}
                </span>
            )
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '150px',
            render: (value, item) => (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(item)}
                >
                    Редактировать
                </Button>
            )
        }
    ];

    return (
        <>
            <AdminTable<Country>
                title="Управление странами"
                data={countries}
                columns={columns}
                loadingState={loadingState}
                entityName="стран"
                emptyMessage="Нет стран"
                onRefresh={loadCountries}
                onCreateNew={handleCreate}
                createButtonText="Создать страну"
                itemsPerPage={10}
            />

            {/* Модальное окно с формой */}
            <AdminForm
                title={editingCountry ? 'Редактировать страну' : 'Создать страну'}
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSaveCountry}
                fields={COUNTRY_FORM_FIELDS}
                initialData={getFormInitialData()}
                isSubmitting={isSubmitting}
                submitButtonText={editingCountry ? 'Сохранить' : 'Создать'}
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
