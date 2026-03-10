'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAdminListings, setListingStatus, deleteAdminProduct, updateProduct } from '@/api/products/methods';
import { getAllBrands } from '@/api/brands/methods';
import { getAllCategories } from '@/api/categories/methods';
import { Product, CurrencyList, QuantityType, ProductStatus } from '@/api/products/models';
import { usePageTitle } from '@/components/AuthWrapper';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/ui/Notification/Notification';
import { AdminForm, FormField } from '@/components/AdminForm/AdminForm';
import { apiUrl } from '@/api/api';
import Image from 'next/image';

const ADMIN_USER_ID = '6737529504';

type ListingStatus = 'active' | 'inactive' | 'sold';

function getListingStatus(product: Product): ListingStatus {
    if (product.status === ProductStatus.SOLD) return 'sold';
    if (!product.isActive) return 'inactive';
    return 'active';
}

const STATUS_CONFIG: Record<ListingStatus, { label: string; bg: string; color: string }> = {
    active:   { label: 'Активно',    bg: '#dcfce7', color: '#15803d' },
    inactive: { label: 'Не активно', bg: '#f1f5f9', color: '#64748b' },
    sold:     { label: 'Продано',    bg: '#dbeafe', color: '#1d4ed8' },
};

function StatusBadge({ status, onChange }: { status: ListingStatus; onChange: (s: ListingStatus) => void }) {
    const [open, setOpen] = useState(false);
    const cfg = STATUS_CONFIG[status];
    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    background: cfg.bg, color: cfg.color,
                    border: 'none', borderRadius: '20px',
                    padding: '3px 10px', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                }}
            >
                {cfg.label} ▾
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, zIndex: 100,
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: '130px',
                }}>
                    {(Object.keys(STATUS_CONFIG) as ListingStatus[]).map(s => (
                        <button
                            key={s}
                            onClick={() => { onChange(s); setOpen(false); }}
                            style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '8px 14px', border: 'none', background: s === status ? '#f8fafc' : '#fff',
                                color: STATUS_CONFIG[s].color, fontSize: '13px', fontWeight: s === status ? 600 : 400,
                                cursor: 'pointer',
                            }}
                        >
                            {STATUS_CONFIG[s].label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', maxWidth: '400px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                <p style={{ marginBottom: '20px', fontSize: '15px', color: '#1e293b', lineHeight: 1.5 }}>{message}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>Отмена</button>
                    <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Удалить</button>
                </div>
            </div>
        </div>
    );
}

export default function ListingsPage() {
    const { setPageTitle } = usePageTitle();
    const { notification, showNotification } = useNotification();

    const [listings, setListings] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<ListingStatus | ''>('');

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [selectedFormCategory, setSelectedFormCategory] = useState('');

    const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

    useEffect(() => { setPageTitle('Мои объявления'); }, [setPageTitle]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [listingsRes, brandsRes, catsRes] = await Promise.all([
                getAdminListings(ADMIN_USER_ID),
                getAllBrands(),
                getAllCategories(),
            ]);
            setListings(listingsRes);
            setBrands(brandsRes);
            setCategories(catsRes);
        } catch (e: any) {
            showNotification({ message: e.message || 'Ошибка загрузки', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const mainCategories = useMemo(() => categories.filter(c => !c.parentId), [categories]);

    const filtered = useMemo(() => listings.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
            || (p.customId?.toLowerCase().includes(search.toLowerCase()) ?? false);
        const matchStatus = !filterStatus || getListingStatus(p) === filterStatus;
        return matchSearch && matchStatus;
    }), [listings, search, filterStatus]);

    const stats = useMemo(() => ({
        total: listings.length,
        active: listings.filter(p => getListingStatus(p) === 'active').length,
        inactive: listings.filter(p => getListingStatus(p) === 'inactive').length,
        sold: listings.filter(p => getListingStatus(p) === 'sold').length,
    }), [listings]);

    const handleStatusChange = async (product: Product, newStatus: ListingStatus) => {
        try {
            await setListingStatus(product.id, newStatus);
            setListings(prev => prev.map(p => {
                if (p.id !== product.id) return p;
                if (newStatus === 'active') return { ...p, isActive: true, status: ProductStatus.APPROVED };
                if (newStatus === 'sold') return { ...p, isActive: false, status: ProductStatus.SOLD };
                return { ...p, isActive: false, status: ProductStatus.APPROVED };
            }));
            showNotification({ message: 'Статус обновлён', type: 'success' });
        } catch (e: any) {
            showNotification({ message: e.message, type: 'error' });
        }
    };

    const handleDelete = async (product: Product) => {
        try {
            await deleteAdminProduct(product.id);
            setListings(prev => prev.filter(p => p.id !== product.id));
            showNotification({ message: 'Объявление удалено', type: 'success' });
        } catch (e: any) {
            showNotification({ message: e.message, type: 'error' });
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        const currentCategory = categories.find(c => c.id === product.category?.id);
        const isSubcat = currentCategory?.parentId;
        const catId = isSubcat ? currentCategory?.parentId || '' : product.category?.id || '';
        setSelectedFormCategory(catId);
        setFormData({
            customId: product.customId || '',
            name: product.name,
            priceCash: Number(product.priceCash),
            priceNonCash: Number(product.priceNonCash),
            currency: product.currency,
            preview: product.preview,
            files: product.files || [],
            description: product.description,
            categoryId: catId,
            subcategoryId: isSubcat ? product.category?.id || '' : '',
            brandId: product.brand?.id || '',
            quantity: product.quantity,
            quantityType: product.quantityType,
            status: product.status,
            isActive: Boolean(product.isActive),
        });
        setIsModalOpen(true);
    };

    const getFormFields = (): FormField[] => [
        { name: 'customId', label: 'ID объявления', type: 'text', placeholder: 'TE-0001' },
        { name: 'name', label: 'Название', type: 'text', required: true },
        { name: 'priceCash', label: 'Цена (наличные)', type: 'number' },
        { name: 'priceNonCash', label: 'Цена (безнал)', type: 'number' },
        { name: 'currency', label: 'Валюта', type: 'select', required: true,
          options: Object.values(CurrencyList).map(v => ({ value: v, label: v })) },
        { name: 'preview', label: 'Превью', type: 'file', accept: 'image/*' },
        { name: 'files', label: 'Доп. фото', type: 'file', accept: 'image/*,video/*', multiple: true },
        { name: 'description', label: 'Описание', type: 'textarea', required: true },
        { name: 'categoryId', label: 'Категория', type: 'select', required: true,
          options: mainCategories.map(c => ({ value: c.id, label: c.name })) },
        { name: 'subcategoryId', label: 'Подкатегория', type: 'select',
          options: categories.filter(c => c.parentId === selectedFormCategory).map(c => ({ value: c.id, label: c.name })) },
        { name: 'brandId', label: 'Бренд', type: 'select', required: true,
          options: brands.map(b => ({ value: b.id, label: b.name })) },
        { name: 'quantity', label: 'Количество', type: 'number', required: true },
        { name: 'quantityType', label: 'Тип', type: 'select', required: true,
          options: [{ value: QuantityType.PIECE, label: 'Штуки' }, { value: QuantityType.SET, label: 'Комплекты' }] },
        { name: 'isActive', label: 'Активно', type: 'checkbox' },
    ];

    const handleSave = async (data: any) => {
        if (!editingProduct) return;
        setIsSubmitting(true);
        try {
            let processedData = { ...data };
            if (!processedData.priceCash) processedData.priceCash = 0;
            if (!processedData.priceNonCash) processedData.priceNonCash = 0;
            if (processedData.subcategoryId) processedData.categoryId = processedData.subcategoryId;
            delete processedData.subcategoryId;
            if (!Array.isArray(processedData.files)) processedData.files = [];

            await updateProduct(editingProduct.id, {
                ...processedData,
                userId: ADMIN_USER_ID,
                status: processedData.isActive ? ProductStatus.APPROVED : ProductStatus.APPROVED,
            });
            showNotification({ message: 'Сохранено', type: 'success' });
            await loadData();
            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (e: any) {
            showNotification({ message: e.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormFieldChange = (fieldName: string, _value: any, currentFormData: any) => {
        setFormData(currentFormData);
        if (fieldName === 'categoryId') {
            setSelectedFormCategory(_value);
            setFormData(prev => ({ ...prev, subcategoryId: '' }));
        }
    };

    const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap', borderBottom: '1px solid #e2e8f0' };
    const td: React.CSSProperties = { padding: '10px 12px', fontSize: '13px', color: '#1e293b', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9' };

    return (
        <div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                    { label: 'Всего', value: stats.total, color: '#1e293b', bg: '#f8fafc' },
                    { label: 'Активных', value: stats.active, color: '#15803d', bg: '#dcfce7' },
                    { label: 'Не активных', value: stats.inactive, color: '#64748b', bg: '#f1f5f9' },
                    { label: 'Продано', value: stats.sold, color: '#1d4ed8', bg: '#dbeafe' },
                ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '14px 20px', minWidth: '100px' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Поиск по названию или ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', width: '260px' }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                    {([['', 'Все'], ['active', 'Активные'], ['inactive', 'Не активные'], ['sold', 'Проданные']] as [string, string][]).map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setFilterStatus(val as any)}
                            style={{
                                padding: '7px 14px', borderRadius: '20px', border: '1px solid #e2e8f0',
                                background: filterStatus === val ? '#1e293b' : '#fff',
                                color: filterStatus === val ? '#fff' : '#64748b',
                                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Загрузка...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Объявлений нет</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    <th style={th}>ID</th>
                                    <th style={th}>Фото</th>
                                    <th style={{ ...th, minWidth: '200px' }}>Название</th>
                                    <th style={th}>Категория</th>
                                    <th style={th}>Бренд</th>
                                    <th style={th}>Цена</th>
                                    <th style={th}>Фото</th>
                                    <th style={th}>Статус</th>
                                    <th style={th}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(product => (
                                    <tr key={product.id} style={{ transition: 'background 0.1s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '')}>
                                        <td style={{ ...td, fontFamily: 'monospace', fontWeight: 600, color: '#64748b', fontSize: '12px' }}>
                                            {product.customId || '—'}
                                        </td>
                                        <td style={td}>
                                            {product.preview ? (
                                                <Image
                                                    src={`${apiUrl}/files/${product.preview}`}
                                                    alt={product.name}
                                                    width={48} height={48}
                                                    style={{ borderRadius: '6px', objectFit: 'cover' }}
                                                    unoptimized
                                                />
                                            ) : <div style={{ width: 48, height: 48, background: '#f1f5f9', borderRadius: '6px' }} />}
                                        </td>
                                        <td style={td}>
                                            <div style={{ fontWeight: 500, lineHeight: 1.3 }}>{product.name}</div>
                                        </td>
                                        <td style={{ ...td, color: '#64748b' }}>{product.category?.name || '—'}</td>
                                        <td style={{ ...td, color: '#64748b' }}>{product.brand?.name || '—'}</td>
                                        <td style={{ ...td, fontWeight: 600 }}>
                                            {Number(product.priceCash) === 0 ? 'По запросу' : `${Number(product.priceCash).toLocaleString()} ${product.currency}`}
                                        </td>
                                        <td style={{ ...td, color: '#94a3b8' }}>
                                            {Array.isArray(product.files) ? product.files.length : 0}
                                        </td>
                                        <td style={td}>
                                            <StatusBadge
                                                status={getListingStatus(product)}
                                                onChange={s => handleStatusChange(product, s)}
                                            />
                                        </td>
                                        <td style={td}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                                                >
                                                    Изменить
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(product)}
                                                    style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit modal */}
            <AdminForm
                title="Редактировать объявление"
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
                onSubmit={handleSave}
                fields={getFormFields()}
                initialData={Object.keys(formData).length > 0 ? formData : {}}
                isSubmitting={isSubmitting}
                submitButtonText="Сохранить"
                onFieldChange={handleFormFieldChange}
            />

            {/* Delete confirm */}
            {confirmDelete && (
                <ConfirmDialog
                    message={`Удалить объявление «${confirmDelete.name}»? Оно исчезнет с сайта.`}
                    onConfirm={() => handleDelete(confirmDelete)}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {notification && (
                <Notification message={notification.message} type={notification.type} onClose={notification.onClose} />
            )}
        </div>
    );
}
