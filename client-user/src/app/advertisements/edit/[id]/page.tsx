'use client';

import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import {
  AdvertisementForm,
  type AdvertisementFormValues,
} from '@/components/Advertisements/AdvertisementForm';
import { useProduct, useUpdateProduct } from '@/features/products/hooks';
import type { UpdateProductRequest } from '@/api/products/types';
import { uploadFile } from '@/api/files/methods';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { resolveCategoryId } from '@/utils/category';
import { toImageSrc } from '@/utils/toImageSrc';
import { useMemo } from 'react';

export default function EditAdsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, status } = useProduct(id);
  const isLoading = status === 'pending';
  const update = useUpdateProduct();

  const initialValues = useMemo<
    Partial<AdvertisementFormValues> | undefined
  >(() => {
    if (!product) return undefined;
    return {
      title: product.name,
      description: product.description,
      priceCash: Number(product.priceCash ?? 0),
      priceNonCash: Number(product.priceNonCash ?? 0),
      currency: String(product.currency),
      categoryId: product.category?.id ?? '',
      subcategoryId: '', // если нужно — вычисли из product
      brandId: product.brand?.id ?? '',
      quantity: product.quantity ?? 1,
      unit: product.quantityType ?? 'piece',
    };
  }, [product]);

  const initialPreviewUrl = useMemo(
    () => (product?.preview ? toImageSrc(product.preview) : null),
    [product?.preview],
  );

  const initialFileNames = useMemo(
    () => (Array.isArray(product?.files) ? (product!.files as string[]) : []),
    [product],
  );

  const uploadSingle = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const { filename } = await uploadFile(fd);
    return filename;
  };

  const handleEdit = async (
    form: AdvertisementFormValues & {
      files: File[];
      previewFile: File | null;
      keepFileNames: string[];
    },
  ): Promise<boolean> => {
    if (!product || !id) return false;

    try {
      const uploaded = await Promise.all((form.files ?? []).map(uploadSingle));
      const files = Array.from(new Set([...form.keepFileNames, ...uploaded]));

      const preview = form.previewFile
        ? await uploadSingle(form.previewFile)
        : product.preview;

      if (!preview) {
        toast.error('Добавьте обложку (превью)');
        return false;
      }

      const body: UpdateProductRequest = {
        name: form.title,
        description: form.description,
        priceCash: Number(form.priceCash) || 0,
        priceNonCash:
          typeof form.priceNonCash === 'number'
            ? form.priceNonCash
            : Number(form.priceNonCash ?? form.priceNonCash) || 0,
        currency: form.currency as any,
        categoryId: resolveCategoryId(
          form.categoryId || product.category?.id,
          form.subcategoryId,
        ),
        brandId: form.brandId || product.brand?.id || '',
        preview,
        files,
        quantity: Number(form.quantity) || 1,
        quantityType: form.unit === 'set' ? 'set' : 'piece',
      };

      const ok = await update.mutateAsync({ id, body });
      if (ok) {
        toast.success('Объявление обновлено');
        return true;
      }
      toast.error('Не удалось обновить объявление');
      return false;
    } catch (e: any) {
      toast.error(e?.message ?? 'Ошибка при обновлении объявления');
      return false;
    }
  };

  if (status === 'error') {
    return (
      <ProtectedRoute>
        <Page back={true}>
          <Layout className='p-2 pt-4'>
            <div className='text-center text-red-500'>
              Не удалось загрузить объявление
            </div>
          </Layout>
        </Page>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Page back={true}>
        <Layout className='p-2 pt-4 space-y-5 text-black'>
          <h2 className='text-center text-lg font-medium'>
            Изменить объявление
          </h2>

          <AdvertisementForm
            productId={product?.id}
            initialValues={initialValues}
            initialPreviewUrl={initialPreviewUrl}
            initialFileNames={initialFileNames}
            submitLabel={update.isPending ? 'Сохранение…' : 'Сохранить'}
            loading={isLoading}
            onSubmit={handleEdit}
            mode='edit'
            maxFiles={5}
            isActive={product?.isActive}
          />
        </Layout>
      </Page>
    </ProtectedRoute>
  );
}
