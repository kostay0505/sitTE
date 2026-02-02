'use client';

import { useState, useEffect } from 'react';
import { getAllVacancies, createVacancy, updateVacancy } from '@/api/vacancies/methods';
import { Vacancy } from '@/api/vacancies/models';
import { Button } from '@/components/ui/Button/Button';
import { COLORS } from '@/constants/ui';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/ui/Notification/Notification';
import { AdminForm, FormField } from '@/components/AdminForm/AdminForm';
import { usePageTitle } from '@/components/AuthWrapper';
import { AdminTable } from '@/components/AdminTable/AdminTable';
import { TableColumn, LoadingState } from '@/types/common';

import { getAllCities } from '@/api/cities/methods';

export default function VacanciesPage() {
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    // Справочники
    const [cities, setCities] = useState<any[]>([]);

    // Модальные окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { notification, showNotification } = useNotification();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Управление вакансиями');
    }, [setPageTitle]);

    // Загрузка данных
    const loadData = async () => {
        try {
            setLoadingState({ isLoading: true, error: null });
            const [vacanciesResponse, citiesResponse] = await Promise.all([
                getAllVacancies(),
                getAllCities()
            ]);
            setVacancies(vacanciesResponse);
            setCities(citiesResponse);
        } catch (err: any) {
            const errorMessage = err.message || 'Не удалось загрузить данные';
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
        loadData();
    }, []);

    // Обработчики
    const handleCreate = () => {
        setEditingVacancy(null);
        setIsModalOpen(true);
    };

    const handleEdit = (vacancy: Vacancy) => {
        setEditingVacancy(vacancy);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVacancy(null);
    };

    const handleSaveVacancy = async (vacancyData: any) => {
        setIsSubmitting(true);

        try {
            if (editingVacancy) {
                await updateVacancy(editingVacancy.id, vacancyData);
                showNotification({
                    message: 'Вакансия успешно обновлена',
                    type: 'success'
                });
            } else {
                await createVacancy(vacancyData);
                showNotification({
                    message: 'Вакансия успешно создана',
                    type: 'success'
                });
            }

            await loadData();
            closeModal();
        } catch (err: any) {
            console.error('Ошибка при сохранении вакансии:', err);
            showNotification({
                message: err.message || 'Произошла ошибка',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Подготовка полей формы
    const getFormFields = (): FormField[] => [
        {
            name: 'userId',
            label: 'Пользователь',
            type: 'text',
            required: true,
            placeholder: 'Введите ID пользователя'
        },
        {
            name: 'firstName',
            label: 'Имя',
            type: 'text',
            required: true,
            placeholder: 'Введите имя'
        },
        {
            name: 'lastName',
            label: 'Фамилия',
            type: 'text',
            required: false,
            placeholder: 'Введите фамилию'
        },
        {
            name: 'companyName',
            label: 'Компания',
            type: 'text',
            required: true,
            placeholder: 'Введите название компании'
        },
        {
            name: 'position',
            label: 'Должность',
            type: 'text',
            required: true,
            placeholder: 'Введите должность'
        },
        {
            name: 'phone',
            label: 'Телефон',
            type: 'text',
            required: false,
            placeholder: 'Введите телефон'
        },
        {
            name: 'cityId',
            label: 'Город',
            type: 'select',
            required: true,
            placeholder: 'Выберите город',
            options: cities.map(city => ({
                value: city.id,
                label: city.name + (city.country ? ` (${city.country.name})` : '')
            }))
        },
        {
            name: 'address',
            label: 'Адрес',
            type: 'text',
            required: true,
            placeholder: 'Введите адрес'
        },
        {
            name: 'description',
            label: 'Описание',
            type: 'textarea',
            required: true,
            placeholder: 'Введите описание'
        },
        {
            name: 'isActive',
            label: 'Активна',
            type: 'checkbox',
            required: false
        }
    ];

    // Подготовка данных для формы
    const getFormInitialData = () => {
        if (!editingVacancy) {
            return {
                userId: '',
                firstName: '',
                lastName: '',
                companyName: '',
                position: '',
                phone: '',
                cityId: '',
                address: '',
                description: '',
                isActive: true
            };
        }

        return {
            userId: editingVacancy.user?.tgId || '',
            firstName: editingVacancy.firstName,
            lastName: editingVacancy.lastName,
            companyName: editingVacancy.companyName,
            position: editingVacancy.position,
            phone: editingVacancy.phone,
            cityId: editingVacancy.city?.id || '',
            address: editingVacancy.address,
            description: editingVacancy.description,
            isActive: Boolean(editingVacancy.isActive)
        };
    };

    // Колонки таблицы
    const columns: TableColumn<Vacancy>[] = [
        {
            key: 'position',
            title: 'Должность',
            width: '250px'
        },
        {
            key: 'companyName',
            title: 'Компания',
            width: '200px'
        },
        {
            key: 'user',
            title: 'Пользователь',
            width: '150px',
            render: (value) => value?.tgId || ''
        },
        {
            key: 'city',
            title: 'Город',
            width: '200px',
            render: (value) => value?.name + (value?.country ? ` (${value.country.name})` : '') || ''
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
            <AdminTable<Vacancy>
                title="Управление вакансиями"
                data={vacancies}
                columns={columns}
                loadingState={loadingState}
                entityName="вакансий"
                emptyMessage="Нет вакансий"
                onRefresh={loadData}
                onCreateNew={handleCreate}
                createButtonText="Создать вакансию"
                itemsPerPage={10}
            />

            {/* Модальное окно с формой */}
            <AdminForm
                title={editingVacancy ? 'Редактировать вакансию' : 'Создать вакансию'}
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSaveVacancy}
                fields={getFormFields()}
                initialData={getFormInitialData()}
                isSubmitting={isSubmitting}
                submitButtonText={editingVacancy ? 'Сохранить' : 'Создать'}
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
