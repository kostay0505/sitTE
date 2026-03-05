'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/api/categories/methods';
import { Category } from '@/api/categories/models';
import { Button } from '@/components/ui/Button/Button';
import { COLORS } from '@/constants/ui';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/ui/Notification/Notification';
import { AdminForm, FormField } from '@/components/AdminForm/AdminForm';
import { usePageTitle } from '@/components/AuthWrapper';
import { AdminTable } from '@/components/AdminTable/AdminTable';
import { TableColumn, LoadingState } from '@/types/common';

const getCategoryFormFields = (categories: Category[], editingCategory: Category | null): FormField[] => [
    {
        name: 'name',
        label: 'Название',
        type: 'text',
        required: true,
        placeholder: 'Введите название категории'
    },
    {
        name: 'slug',
        label: 'URL-слаг (slug)',
        type: 'text',
        required: false,
        placeholder: 'например: zvukovoe-oborudovanie'
    },
    {
        name: 'parentId',
        label: 'Родительская категория',
        type: 'select',
        required: false,
        placeholder: 'Выберите родительскую категорию',
        options: categories
            .filter(cat => !cat.parentId && (!editingCategory || cat.id !== editingCategory.id))
            .map(cat => ({ value: cat.id, label: cat.name }))
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
        label: 'Активна',
        type: 'checkbox',
        required: false
    }
];

const CategoryFilter = ({
    categories,
    selectedParentId,
    onFilterChange,
}: {
    categories: Category[];
    selectedParentId: string;
    onFilterChange: (parentId: string) => void;
}) => {
    const parentCategories = categories.filter(cat => !cat.parentId);
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
            padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef'
        }}>
            <label style={{ fontWeight: '500', color: '#495057', minWidth: 'fit-content' }}>
                Фильтр по родительской категории:
            </label>
            <select
                value={selectedParentId}
                onChange={(e) => onFilterChange(e.target.value)}
                style={{
                    padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px',
                    fontSize: '14px', minWidth: '200px', backgroundColor: 'white'
                }}
            >
                <option value="">Все категории</option>
                {parentCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>
            {selectedParentId && (
                <Button variant="ghost" size="sm" onClick={() => onFilterChange('')}
                    style={{ padding: '4px 8px', fontSize: '12px' }}>
                    Сбросить
                </Button>
            )}
        </div>
    );
};

// Confirmation dialog
const ConfirmDialog = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    isLoading,
}: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
}) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
            <div style={{
                background: 'white', borderRadius: '12px', padding: '24px',
                maxWidth: '480px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600 }}>{title}</h3>
                <p style={{ margin: '0 0 24px', color: '#555', lineHeight: 1.5 }}>{message}</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                        Отмена
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        disabled={isLoading}
                        style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                    >
                        {isLoading ? 'Удаление...' : 'Удалить'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: true, error: null });
    const [selectedParentId, setSelectedParentId] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete state
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { notification, showNotification } = useNotification();
    const { setPageTitle } = usePageTitle();

    useEffect(() => { setPageTitle('Управление категориями'); }, [setPageTitle]);

    const filteredCategories = useMemo(() => {
        if (!selectedParentId) return categories;
        return categories.filter(category => category.parentId === selectedParentId);
    }, [categories, selectedParentId]);

    const loadCategories = async () => {
        try {
            setLoadingState({ isLoading: true, error: null });
            const response = await getAllCategories();
            setCategories(response);
        } catch (err: any) {
            const msg = err.message || 'Не удалось загрузить категории';
            setLoadingState({ isLoading: false, error: msg });
            showNotification({ message: msg, type: 'error' });
        } finally {
            setLoadingState({ isLoading: false, error: null });
        }
    };

    useEffect(() => { loadCategories(); }, []);

    const handleCreate = () => { setEditingCategory(null); setIsModalOpen(true); };
    const handleEdit = (category: Category) => { setEditingCategory(category); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingCategory(null); };

    const handleSaveCategory = async (categoryData: any) => {
        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryData);
                showNotification({ message: 'Категория успешно обновлена', type: 'success' });
            } else {
                await createCategory(categoryData);
                showNotification({ message: 'Категория успешно создана', type: 'success' });
            }
            await loadCategories();
            closeModal();
        } catch (err: any) {
            showNotification({ message: err.message || 'Произошла ошибка', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (category: Category) => {
        setDeletingCategory(category);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingCategory) return;
        setIsDeleting(true);
        try {
            const result = await deleteCategory(deletingCategory.id);
            showNotification({ message: result.message, type: 'success' });
            await loadCategories();
            setDeletingCategory(null);
        } catch (err: any) {
            showNotification({ message: err.message || 'Не удалось удалить категорию', type: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    const getFormInitialData = () => {
        if (!editingCategory) return { name: '', parentId: '', displayOrder: 0, isActive: true, slug: '' };
        return {
            name: editingCategory.name,
            parentId: editingCategory.parentId || '',
            displayOrder: editingCategory.displayOrder,
            isActive: Boolean(editingCategory.isActive),
            slug: editingCategory.slug || '',
        };
    };

    const getParentCategoryName = (parentId: string | undefined) => {
        if (!parentId) return '-';
        const parent = categories.find(c => c.id === parentId);
        return parent ? parent.name : 'Не найдена';
    };

    // Count children to show in confirm message
    const getDeleteMessage = (cat: Category) => {
        const children = categories.filter(c => c.parentId === cat.id);
        if (children.length > 0) {
            return `Вы удаляете родительскую категорию «${cat.name}» вместе с ${children.length} подкатегориями: ${children.map(c => c.name).join(', ')}. Все объявления из этих категорий будут перенесены в «Без категории». Это действие необратимо.`;
        }
        return `Вы удаляете категорию «${cat.name}». Все объявления из неё будут перенесены в «Без категории». Это действие необратимо.`;
    };

    const columns: TableColumn<Category>[] = [
        { key: 'name', title: 'Название', width: '250px' },
        {
            key: 'parentId', title: 'Родительская', width: '200px',
            render: (value) => getParentCategoryName(value)
        },
        { key: 'displayOrder', title: 'Порядок', width: '90px' },
        {
            key: 'isActive', title: 'Статус', width: '100px',
            render: (value) => (
                <span style={{ color: value ? COLORS.SUCCESS.DARK : COLORS.ERROR.DARK }}>
                    {value ? 'Активна' : 'Неактивна'}
                </span>
            )
        },
        {
            key: 'actions', title: 'Действия', width: '200px',
            render: (value, item) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>
                        Изменить
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item)}
                        style={{ color: '#dc3545', borderColor: '#dc3545' }}
                    >
                        Удалить
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            <CategoryFilter
                categories={categories}
                selectedParentId={selectedParentId}
                onFilterChange={setSelectedParentId}
            />

            <AdminTable<Category>
                title="Управление категориями"
                data={filteredCategories}
                columns={columns}
                loadingState={loadingState}
                entityName="категорий"
                emptyMessage={selectedParentId ? "Нет дочерних категорий" : "Нет категорий"}
                onRefresh={loadCategories}
                onCreateNew={handleCreate}
                createButtonText="Создать категорию"
                itemsPerPage={10}
            />

            <AdminForm
                title={editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSaveCategory}
                fields={getCategoryFormFields(categories, editingCategory)}
                initialData={getFormInitialData()}
                isSubmitting={isSubmitting}
                submitButtonText={editingCategory ? 'Сохранить' : 'Создать'}
            />

            <ConfirmDialog
                isOpen={!!deletingCategory}
                title="Удалить категорию?"
                message={deletingCategory ? getDeleteMessage(deletingCategory) : ''}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeletingCategory(null)}
                isLoading={isDeleting}
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
