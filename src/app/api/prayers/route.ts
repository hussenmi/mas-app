
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://api.aladhan.com/v1/timingsByCity';
const DEFAULT_CITY = 'Jamaica';
const DEFAULT_STATE = 'NY';
const DEFAULT_COUNTRY = 'US';
const METHOD = 2; // ISNA

export async function GET(req: NextRequest) {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const url = `${BASE_URL}?city=${DEFAULT_CITY}&state=${DEFAULT_STATE}&country=${DEFAULT_COUNTRY}&method=${METHOD}&date_or_timestamp=${today}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch prayer times');
    const data = await response.json();
    return NextResponse.json(data.data.timings);
  } catch (error) {
    return new NextResponse('Error fetching prayer times', { status: 500 });
  }
}
