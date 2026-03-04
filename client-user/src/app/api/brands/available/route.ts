import { NextResponse } from 'next/server';
import { MOCK_BRANDS } from '../../_mockData';

export async function GET() {
  return NextResponse.json(MOCK_BRANDS);
}
