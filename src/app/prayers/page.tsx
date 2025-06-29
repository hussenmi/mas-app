
'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Iqama time adjustments in minutes
const IQAMA_ADJUSTMENTS: { [key: string]: number } = {
  Fajr: 30,
  Dhuhr: 20,
  Asr: 10,
  Maghrib: 5,
  Isha: 10,
};

export default function PrayersPage() {
  const [times, setTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const res = await fetch('/api/prayers');
        if (!res.ok) {
          throw new Error('Prayer times could not be loaded at this moment.');
        }
        const data = await res.json();
        setTimes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTimes();
  }, []);

  const renderTime = (time: string) => {
    const parsedTime = dayjs(time, 'HH:mm');
    if (parsedTime.isValid()) {
      return parsedTime.format('h:mm A');
    }
    console.warn('Invalid time format received:', time);
    return 'N/A';
  };

  const renderIqamaTime = (prayerName: string, athanTime: string) => {
    const parsedAthanTime = dayjs(athanTime, 'HH:mm');
    if (parsedAthanTime.isValid()) {
      const adjustment = IQAMA_ADJUSTMENTS[prayerName] || 0;
      return parsedAthanTime.add(adjustment, 'minute').format('h:mm A');
    }
    return 'N/A';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg min-h-[calc(100vh-250px)] flex flex-col justify-center">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">Today's Prayer Schedule</h1>
      <p className="text-center text-sm text-gray-600 mb-8">Calculation Method: ISNA (Islamic Society of North America)</p>
      
      {loading ? (
        <p className="text-center text-gray-700 text-lg">Loading prayer times...</p>
      ) : error ? (
        <p className="text-center text-red-600 font-semibold text-lg">{error}</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-green-700 text-white rounded-t-lg font-bold text-lg">
            <span>Prayer</span>
            <span className="text-center">Athan</span>
            <span className="text-right">Iqama</span>
          </div>
          {times && PRAYER_NAMES.map((name) => (
            <div key={name} className="grid grid-cols-3 gap-2 items-center py-3 px-4 bg-gray-50 rounded-lg shadow-sm">
              <span className="text-lg font-medium text-gray-700">{name}</span>
              <span className="text-lg text-center font-semibold text-gray-800">{renderTime(times[name])}</span>
              <span className="text-lg text-right font-bold text-green-800">{renderIqamaTime(name, times[name])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
