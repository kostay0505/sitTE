import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS_BASIC, TEST_PRODUCTS } from '../../_mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brandId');
  const sellerId = searchParams.get('sellerId');
  const categoryId = searchParams.get('categoryId');
  const limit = parseInt(searchParams.get('limit') ?? '24');
  const offset = parseInt(searchParams.get('offset') ?? '0');

  let products = MOCK_PRODUCTS_BASIC;

  if (brandId) {
    products = brandId === 'test-brand-001' ? products : [];
  }

  if (sellerId) {
    products = sellerId === 'test-user-001' ? products : [];
  }

  if (categoryId) {
    const matched = TEST_PRODUCTS.filter(p => p.category.id === categoryId).map(p => ({
      id: p.id,
      name: p.name,
      priceCash: p.priceCash,
      currency: p.currency,
      preview: p.preview,
      description: p.description,
      isNew: p.isNew,
      isFavorite: p.isFavorite,
      status: p.status,
      viewCount: p.viewCount,
      url: `https://touringexpertsale.ru/catalog/${p.id}`,
    }));
    products = matched;
  }

  return NextResponse.json(products.slice(offset, offset + limit));
}
