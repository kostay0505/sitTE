'use client';

import { useState, useEffect } from 'react';
import { getAllResumes, createResume, updateResume } from '@/api/resumes/methods';
import { Resume } from '@/api/resumes/models';
import { Button } from '@/components/ui/Button/Button';
import { COLORS } from '@/constants/ui';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/ui/Notification/Notification';
import { AdminForm, FormField } from '@/components/AdminForm/AdminForm';
import { usePageTitle } from '@/components/AuthWrapper';
import { uploadFile } from '@/api/files/methods';
import { AdminTable } from '@/components/AdminTable/AdminTable';
import { TableColumn, LoadingState } from '@/types/common';

import { getAllCities } from '@/api/cities/methods';

export default function ResumesPage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    // Справочники
    const [cities, setCities] = useState<any[]>([]);

    // Модальные окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResume, setEditingResume] = useState<Resume | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { notification, showNotification } = useNotification();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Управление резюме');
    }, [setPageTitle]);

    // Загрузка данных
    const loadData = async () => {
        try {
            setLoadingState({ isLoading: true, error: null });
            const [resumesResponse, citiesResponse] = await Promise.all([
                getAllResumes(),
                getAllCities()
            ]);
            setResumes(resumesResponse);
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
        setEditingResume(null);
        setIsModalOpen(true);
    };

    const handleEdit = (resume: Resume) => {
        setEditingResume(resume);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingResume(null);
    };

    const handleSaveResume = async (resumeData: any) => {
        setIsSubmitting(true);

        try {
            let processedData = { ...resumeData };

            // Обработка файлов
            if (resumeData.files && Array.isArray(resumeData.files)) {
                const uploadedFiles = await Promise.all(
                    resumeData.files.map(async (file: File) => {
                        if (file instanceof File) {
                            const formData = new FormData();
                            formData.append('file', file);
                            const result = await uploadFile(formData);
                            return result.filename;
                        }
                        return file;
                    })
                );
                processedData.files = uploadedFiles;
            }

            if (editingResume) {
                await updateResume(editingResume.id, processedData);
                showNotification({
                    message: 'Резюме успешно обновлено',
                    type: 'success'
                });
            } else {
                await createResume(processedData);
                showNotification({
                    message: 'Резюме успешно создано',
                    type: 'success'
                });
            }

            await loadData();
            closeModal();
        } catch (err: any) {
            console.error('Ошибка при сохранении резюме:', err);
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
            name: 'description',
            label: 'Описание',
            type: 'textarea',
            required: true,
            placeholder: 'Введите описание'
        },
        {
            name: 'files',
            label: 'Файлы',
            type: 'file',
            accept: 'application/pdf,image/*',
            multiple: true,
            required: true,
            helpText: 'Загрузите файлы резюме (до 5мб)',
        },
        {
            name: 'isActive',
            label: 'Активно',
            type: 'checkbox',
            required: false
        }
    ];

    // Подготовка данных для формы
    const getFormInitialData = () => {
        if (!editingResume) {
            return {
                userId: '',
                firstName: '',
                lastName: '',
                position: '',
                phone: '',
                cityId: '',
                description: '',
                files: [],
                isActive: true
            };
        }

        return {
            userId: editingResume.user?.tgId || '',
            firstName: editingResume.firstName,
            lastName: editingResume.lastName,
            position: editingResume.position,
            phone: editingResume.phone,
            cityId: editingResume.city?.id || '',
            description: editingResume.description,
            files: editingResume.files,
            isActive: Boolean(editingResume.isActive)
        };
    };

    // Колонки таблицы
    const columns: TableColumn<Resume>[] = [
        {
            key: 'firstName',
            title: 'Имя',
            width: '200px',
            render: (value, item) => `${value} ${item.lastName || ''}`
        },
        {
            key: 'user',
            title: 'Пользователь',
            width: '150px',
            render: (value) => value?.tgId || ''
        },
        {
            key: 'position',
            title: 'Должность',
            width: '200px'
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
                    {value ? 'Активно' : 'Неактивно'}
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
            <AdminTable<Resume>
                title="Управление резюме"
                data={resumes}
                columns={columns}
                loadingState={loadingState}
                entityName="резюме"
                emptyMessage="Нет резюме"
                onRefresh={loadData}
                onCreateNew={handleCreate}
                createButtonText="Создать резюме"
                itemsPerPage={10}
            />

            {/* Модальное окно с формой */}
            <AdminForm
                title={editingResume ? 'Редактировать резюме' : 'Создать резюме'}
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSaveResume}
                fields={getFormFields()}
                initialData={getFormInitialData()}
                isSubmitting={isSubmitting}
                submitButtonText={editingResume ? 'Сохранить' : 'Создать'}
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
