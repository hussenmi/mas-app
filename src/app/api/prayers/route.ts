
import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { cache } from '@/lib/cache';

const BASE_URL = 'http://api.aladhan.com/v1/timingsByAddress';
const MAS_QUEENS_ADDRESS = '46-01 20th Ave, Astoria, NY 11105, US';
const METHOD = 2; // ISNA

// Iqama delays in minutes
const IQAMA_DELAYS = {
  Fajr: 20,
  Dhuhr: 10,
  Asr: 10,
  Maghrib: 5,
  Isha: 10
};

function calculateIqamaTimes(prayerTimes: any) {
  const iqamaTimes: any = {};
  
  Object.keys(IQAMA_DELAYS).forEach(prayer => {
    const prayerTime = prayerTimes[prayer];
    if (prayerTime) {
      try {
        const delay = IQAMA_DELAYS[prayer as keyof typeof IQAMA_DELAYS];
        // Handle both "HH:mm (EDT)" and "HH:mm" formats
        const timeOnly = prayerTime.split(' ')[0]; // Take only the time part
        const iqamaTime = dayjs(timeOnly, 'HH:mm').add(delay, 'minute');
        iqamaTimes[prayer] = iqamaTime.format('HH:mm');
      } catch (error) {
        console.error(`Error calculating iqama time for ${prayer}:`, error);
        iqamaTimes[prayer] = prayerTime; // Fallback to original time
      }
    }
  });
  
  return iqamaTimes;
}

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateKey = `${day}-${month}-${year}`;
    
    // Check cache first (24 hour TTL for prayer times)
    const cacheKey = `prayer-times-${dateKey}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached prayer times');
      return NextResponse.json(cachedData);
    }
    
    console.log('Fetching fresh prayer times from API');
    const url = `${BASE_URL}?address=${encodeURIComponent(MAS_QUEENS_ADDRESS)}&method=${METHOD}&date=${dateKey}`;
    
    const response = await fetch(url, { 
      next: { revalidate: 86400 }, // Cache for 24 hours
      headers: {
        'Cache-Control': 'max-age=86400'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch prayer times: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !data.data.timings) {
      throw new Error('Invalid prayer times data structure');
    }
    
    const prayerTimes = {
      Fajr: data.data.timings.Fajr.split(' ')[0], // Remove timezone info
      Dhuhr: data.data.timings.Dhuhr.split(' ')[0],
      Asr: data.data.timings.Asr.split(' ')[0],
      Maghrib: data.data.timings.Maghrib.split(' ')[0],
      Isha: data.data.timings.Isha.split(' ')[0]
    };
    
    const iqamaTimes = calculateIqamaTimes(prayerTimes);
    
    const responseData = {
      prayerTimes,
      iqamaTimes,
      date: dateKey,
      location: 'Astoria, Queens, NY',
      method: 'ISNA'
    };
    
    // Cache the response for 24 hours (86400 seconds)
    cache.set(cacheKey, responseData, 86400);
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Prayer times API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch prayer times',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
