import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateKey = `${day}-${month}-${year}`;
    
    // Check cache first (24 hour TTL for Islamic date)
    const cacheKey = `islamic-date-${dateKey}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached Islamic date');
      return NextResponse.json(cachedData);
    }
    
    console.log('Fetching fresh Islamic date from API');
    
    const response = await fetch(`http://api.aladhan.com/v1/gToH/${day}-${month}-${year}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
      headers: {
        'Cache-Control': 'max-age=86400'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Islamic date: ${response.status}`);
    }
    
    const data = await response.json();
    
    let formattedDate = 'Islamic Date Unavailable';
    
    if (data.code === 200 && data.data && data.data.hijri) {
      const hijriData = data.data.hijri;
      formattedDate = `${hijriData.day} ${hijriData.month.en} ${hijriData.year} AH`;
    }
    
    const responseData = {
      islamicDate: formattedDate,
      gregorianDate: dateKey
    };
    
    // Cache for 24 hours (86400 seconds)
    cache.set(cacheKey, responseData, 86400);
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Islamic date API error:', error);
    
    // Return a fallback response
    return NextResponse.json({
      islamicDate: 'Islamic Date Unavailable',
      gregorianDate: new Date().toISOString().split('T')[0],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}