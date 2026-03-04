import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SELLER } from '../../../_mockData';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (id === MOCK_SELLER.tgId || id === MOCK_SELLER.username) {
    return NextResponse.json(MOCK_SELLER);
  }
  return NextResponse.json({ message: 'Not found' }, { status: 404 });
}
