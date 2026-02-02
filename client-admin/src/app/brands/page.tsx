'use client';

import { useState, useEffect } from 'react';
import { getAllBrands, createBrand, updateBrand } from '@/api/brands/methods';
import { Brand } from '@/api/brands/models';
import { Button } from '@/components/ui/Button/Button';
import { COLORS } from '@/constants/ui';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/ui/Notification/Notification';
import { AdminForm, FormField } from '@/components/AdminForm/AdminForm';
import { usePageTitle } from '@/components/AuthWrapper';
import { uploadFile } from '@/api/files/methods';
import { apiUrl } from '@/api/api';
import Image from 'next/image';
import { AdminTable } from '@/components/AdminTable/AdminTable';
import { TableColumn, LoadingState } from '@/types/common';

// Компонент для отображения фото бренда
function BrandPhoto({ photo }: { photo: string }) {
    if (!photo) {
        return <span>Нет фото</span>;
    }

    return (
        <Image
            src={`${apiUrl}/files/${photo}`}
            alt="Фото бренда"
            width={60}
            height={60}
            style={{ borderRadius: '4px', objectFit: 'cover' }}
            unoptimized
        />
    );
}

const BRAND_FORM_FIELDS: FormField[] = [
    {
        name: 'name',
        label: 'Название',
        type: 'text',
        required: true,
        placeholder: 'Введите название бренда'
    },
    {
        name: 'photo',
        label: 'Фото',
        type: 'file',
        accept: 'image/*',
        required: true,
        helpText: 'Загрузите фото бренда (до 1000х1000, до 1мб, формат .webp)'
    },
    {
        name: 'description',
        label: 'Описание',
        type: 'textarea',
        required: true,
        placeholder: 'Введите описание бренда'
    },
    {
		name: 'contact',
		label: 'Представитель',
		type: 'text',
		required: false,
		placeholder: 'Введите ссылку представителя',
	},
    {
        name: 'displayOrder',
        label: 'Порядок отображения',
        type: 'number',
        required: true,
        placeholder: 'Введите порядок отображения'
    },
    {
        name: 'isActive',
        label: 'Активен',
        type: 'checkbox',
        required: false
    }
];

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    // Модальные окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { notification, showNotification } = useNotification();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Управление брендами');
    }, [setPageTitle]);

    // Загрузка данных
    const loadBrands = async () => {
        try {
            setLoadingState({ isLoading: true, error: null });
            const response = await getAllBrands();
            setBrands(response);
        } catch (err: any) {
            const errorMessage = err.message || 'Не удалось загрузить бренды';
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
        loadBrands();
    }, []);

    // Обработчики
    const handleCreate = () => {
        setEditingBrand(null);
        setIsModalOpen(true);
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBrand(null);
    };

    const handleSaveBrand = async (brandData: any) => {
        setIsSubmitting(true);

        try {
            let processedData = { ...brandData };

            // Обработка фото
            if (brandData.photo && brandData.photo instanceof File) {
                const formData = new FormData();
                formData.append('file', brandData.photo);
                const result = await uploadFile(formData);
                processedData.photo = result.filename;
            }

            if (editingBrand) {
                await updateBrand(editingBrand.id, processedData);
                showNotification({
                    message: 'Бренд успешно обновлен',
                    type: 'success'
                });
            } else {
                await createBrand(processedData);
                showNotification({
                    message: 'Бренд успешно создан',
                    type: 'success'
                });
            }

            await loadBrands();
            closeModal();
        } catch (err: any) {
            console.error('Ошибка при сохранении бренда:', err);
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
        if (!editingBrand) {
            return {
                name: '',
                photo: '',
                description: '',
                contact: '',
                displayOrder: 0,
                isActive: true
            };
        }

        return {
            name: editingBrand.name,
            photo: editingBrand.photo,
            description: editingBrand.description,
            contact: editingBrand.contact || '',
            displayOrder: editingBrand.displayOrder,
            isActive: Boolean(editingBrand.isActive)
        };
    };

    // Колонки таблицы
    const columns: TableColumn<Brand>[] = [
        {
            key: 'photo',
            title: 'Фото',
            width: '80px',
            render: (value) => <BrandPhoto photo={value} />
        },
        {
            key: 'name',
            title: 'Название',
            width: '300px'
        },
        {
            key: 'displayOrder',
            title: 'Порядок',
            width: '100px'
        },
        {
            key: 'isActive',
            title: 'Статус',
            width: '120px',
            render: (value) => (
                <span style={{
                    color: value ? COLORS.SUCCESS.DARK : COLORS.ERROR.DARK
                }}>
                    {value ? 'Активен' : 'Неактивен'}
                </span>
            )
        },
        {
            key: 'contact',
            title: 'Представитель',
            width: '200px'
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
            <AdminTable<Brand>
                title="Управление брендами"
                data={brands}
                columns={columns}
                loadingState={loadingState}
                entityName="брендов"
                emptyMessage="Нет брендов"
                onRefresh={loadBrands}
                onCreateNew={handleCreate}
                createButtonText="Создать бренд"
                itemsPerPage={10}
            />

            {/* Модальное окно с формой */}
            <AdminForm
                title={editingBrand ? 'Редактировать бренд' : 'Создать бренд'}
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSaveBrand}
                fields={BRAND_FORM_FIELDS}
                initialData={getFormInitialData()}
                isSubmitting={isSubmitting}
                submitButtonText={editingBrand ? 'Сохранить' : 'Создать'}
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
