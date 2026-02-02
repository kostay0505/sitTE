'use client';

import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import {
  AdvertisementForm,
  type AdvertisementFormValues,
} from '@/components/Advertisements/AdvertisementForm';
import { useCreateProduct } from '@/features/products/hooks';
import type { CreateProductRequest } from '@/api/products/types';
import { uploadFile } from '@/api/files/methods';
import { toast } from 'sonner';
import { ROUTES } from '@/config/routes';
import { useRouter } from 'next/navigation';
import { resolveCategoryId } from '@/utils/category';

export default function CreateAdsPage() {
  const router = useRouter();
  const create = useCreateProduct();

  const uploadSingle = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const { filename } = await uploadFile(fd);
    return filename;
  };

  const handleCreate = async (
    form: AdvertisementFormValues & { files: File[]; previewFile: File | null },
  ): Promise<boolean> => {
    try {
      if (!form.previewFile) {
        toast.error('Добавьте обложку (превью)');
        return false;
      }

      const preview = await uploadSingle(form.previewFile);
      const uploaded = await Promise.all((form.files ?? []).map(uploadSingle));

      const body: CreateProductRequest = {
        name: form.title,
        description: form.description,
        priceCash: Number(form.priceCash) || 0,
        priceNonCash: Number(form.priceNonCash) || 0,
        currency: form.currency as any,
        categoryId: resolveCategoryId(form.categoryId, form.subcategoryId),
        brandId: form.brandId,
        quantity: Number(form.quantity) || 1,
        quantityType: form.unit === 'set' ? 'set' : 'piece',
        preview,
        files: uploaded,
      };

      await create.mutateAsync(body);
      toast.success('Объявление создано, и находится на модерации');
      router.push(ROUTES.MY_ADVERTISEMENTS);
      return true;
    } catch (e: any) {
      toast.error(e?.message ?? 'Не удалось создать объявление');
      return false;
    }
  };

  return (
    <ProtectedRoute>
      <Page back={true}>
        <Layout className='p-2 pt-4 space-y-5 text-black'>
          <h2 className='text-center text-lg font-medium'>
            Создать объявление
          </h2>
          <AdvertisementForm
            mode='create'
            onSubmit={handleCreate}
            submitLabel={create.isPending ? 'Создание…' : 'Создать'}
            loading={create.isPending}
          />
        </Layout>
      </Page>
    </ProtectedRoute>
  );
}
