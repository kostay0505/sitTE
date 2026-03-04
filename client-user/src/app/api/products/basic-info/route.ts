import { NextResponse } from 'next/server';
import { MOCK_BASIC_INFO } from '../../_mockData';

export async function GET() {
  return NextResponse.json(MOCK_BASIC_INFO);
}
