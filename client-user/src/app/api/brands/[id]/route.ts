import { NextRequest, NextResponse } from 'next/server';
import { MOCK_BRANDS } from '../../_mockData';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const brand = MOCK_BRANDS.find(b => b.id === id);
  if (!brand) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(brand);
}
