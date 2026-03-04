import { NextResponse } from 'next/server';
import { MOCK_CATEGORIES } from '../../_mockData';

export async function GET() {
  return NextResponse.json(MOCK_CATEGORIES);
}
