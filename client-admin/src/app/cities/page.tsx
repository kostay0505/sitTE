'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAllCities, createCity, updateCity } from '@/api/cities/methods';
import { City } from '@/api/cities/models';
import { getAllCountries } from '@/api/countries/methods';
import { Country } from '@/api/countries/models';
import { AdminTable } from '@/components/AdminTable/AdminTable';
import { TableColumn, LoadingState } from '@/types/common';
import { useNotification } from '@/hooks/useNotification';
import { AdminForm, FormField } from '@/components/AdminForm/AdminForm';
import { Button } from '@/components/ui/Button/Button';
import { Notification } from '@/components/ui/Notification/Notification';

const getCityFormFields = (countries: Country[]): FormField[] => [
    {
        name: 'name',
        label: 'Название',
        type: 'text',
        required: true,
        placeholder: 'Введите название города'
    },
    {
        name: 'countryId',
        label: 'Страна',
        type: 'select',
        required: false,
        placeholder: 'Выберите страну',
        options: countries
            .filter(country => country.isActive)
            .map(country => ({
                value: country.id,
                label: country.name
            }))
    },
    {
        name: 'isActive',
        label: 'Активен',
        type: 'checkbox',
        required: false
    }
];

export default function CitiesPage() {
    const [cities, setCities] = useState<City[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    // Модальные окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { notification, showNotification } = useNotification();

    // Загрузка данных
    const loadData = useCallback(async () => {
        try {
            setLoadingState({ isLoading: true, error: null });
            const [citiesResponse, countriesResponse] = await Promise.all([
                getAllCities(),
                getAllCountries()
            ]);
            setCities(citiesResponse);
            setCountries(countriesResponse);
            setLoadingState({ isLoading: false, error: null });
        } catch (err: any) {
            const errorMessage = err.message || 'Не удалось загрузить города';
            setLoadingState({ isLoading: false, error: errorMessage });
            showNotification({
                message: errorMessage,
                type: 'error'
            });
        }
    }, [showNotification]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Обработчики
    const handleCreate = () => {
        setEditingCity(null);
        setIsModalOpen(true);
    };

    const handleEdit = (city: City) => {
        setEditingCity(city);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCity(null);
    };

    const handleSaveCity = async (cityData: any) => {
        setIsSubmitting(true);

        try {
            if (editingCity) {
                await updateCity(editingCity.id, cityData);
                showNotification({
                    message: 'Город успешно обновлен',
                    type: 'success'
                });
            } else {
                await createCity(cityData);
                showNotification({
                    message: 'Город успешно создан',
                    type: 'success'
                });
            }

            await loadData();
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
        if (!editingCity) {
            return {
                name: '',
                countryId: '',
                isActive: true
            };
        }

        return {
            name: editingCity.name,
            countryId: editingCity.country?.id || editingCity.countryId || '',
            isActive: Boolean(editingCity.isActive)
        };
    };

    // Колонки таблицы
    const columns: TableColumn<City>[] = [
        {
            key: 'name',
            title: 'Название',
            width: '300px'
        },
        {
            key: 'country',
            title: 'Страна',
            width: '200px',
            render: (value) => value?.name || '-'
        },
        {
            key: 'isActive',
            title: 'Статус',
            width: '120px',
            render: (value) => (
                <span style={{
                    color: value ? '#059669' : '#dc2626',
                    fontWeight: '500'
                }}>
                    {value ? 'Активен' : 'Неактивен'}
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
            <AdminTable<City>
                title="Управление городами"
                data={cities}
                columns={columns}
                loadingState={loadingState}
                entityName="городов"
                emptyMessage="Нет городов"
                onRefresh={loadData}
                onCreateNew={handleCreate}
                createButtonText="Создать город"
                itemsPerPage={10}
            />

            {/* Модальное окно с формой */}
            <AdminForm
                title={editingCity ? 'Редактировать город' : 'Создать город'}
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSaveCity}
                fields={getCityFormFields(countries)}
                initialData={getFormInitialData()}
                isSubmitting={isSubmitting}
                submitButtonText={editingCity ? 'Сохранить' : 'Создать'}
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
