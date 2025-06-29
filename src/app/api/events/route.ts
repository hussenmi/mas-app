
import { NextRequest, NextResponse } from 'next/server';

const MOBILIZE_URL = 'https://api.mobilize.us/v1/organizations/1329/events';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(MOBILIZE_URL);
    if (!response.ok) throw new Error('Failed to fetch events');
    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error) {
    return new NextResponse('Error fetching events', { status: 500 });
  }
}
