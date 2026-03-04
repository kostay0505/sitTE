import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS_FULL } from '../../_mockData';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = MOCK_PRODUCTS_FULL.find(p => p.id === id);
  if (!product) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}
