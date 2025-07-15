'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Heart, Users, BookOpen, ChevronRight, Moon, Sun, Sunset } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import HijriDate from 'hijri-date';

dayjs.extend(duration);
dayjs.extend(customParseFormat);

// Prayer icons
const PRAYER_ICONS: { [key: string]: any } = {
  Fajr: Moon,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Type for prayer times
interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface PrayerData {
  prayerTimes: PrayerTimes;
  iqamaTimes: PrayerTimes;
  date: string;
  location: string;
  method: string;
}

interface NextPrayer {
  name: string;
  time: string;
  countdown: string;
}

const PrayerRow = ({ name, time, prayerData, nextPrayer, formatTime, renderIqamaTime, currentTime }: { 
  name: string; 
  time: string; 
  prayerData: PrayerData | null;
  nextPrayer: NextPrayer;
  formatTime: (time: string) => string;
  renderIqamaTime: (prayerName: string, athanTime: string) => string;
  currentTime: Date;
}) => {
  const IconComponent = PRAYER_ICONS[name] || Clock;
  const isNext = nextPrayer?.name === name;
  
  // Check if current time is between athan and iqama
  const isNow = () => {
    const now = dayjs();
    const today = now.format('YYYY-MM-DD');
    
    // Parse athan time
    const athanTime = dayjs(`${today} ${time}`, 'YYYY-MM-DD HH:mm');
    
    // Calculate iqama time
    const IQAMA_ADJUSTMENTS: { [key: string]: number } = {
      Fajr: 20, Dhuhr: 10, Asr: 10, Maghrib: 5, Isha: 10,
    };
    const adjustment = IQAMA_ADJUSTMENTS[name] || 0;
    
    let iqamaTime;
    if (prayerData?.iqamaTimes?.[name]) {
      iqamaTime = dayjs(`${today} ${prayerData.iqamaTimes[name]}`, 'YYYY-MM-DD HH:mm');
    } else {
      iqamaTime = athanTime.add(adjustment, 'minute');
    }
    
    // Check if current time is between athan and iqama
    return now.isAfter(athanTime) && now.isBefore(iqamaTime);
  };
  
  const showNow = isNow();
  
  return (
    <div className={`grid grid-cols-4 gap-4 items-center py-4 px-6 rounded-xl transition-all duration-300 ${
      showNow
        ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400 shadow-lg transform scale-105'
        : isNext 
        ? 'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-400 shadow-lg transform scale-105' 
        : 'bg-white/70 hover:bg-white/90 border border-green-100'
    }`}>
      <div className="flex items-center gap-3">
        <IconComponent className={`w-6 h-6 ${showNow ? 'text-orange-700' : isNext ? 'text-green-700' : 'text-green-600'}`} />
        <span className={`text-lg font-semibold ${showNow ? 'text-orange-800' : isNext ? 'text-green-800' : 'text-gray-700'}`}>
          {name}
        </span>
        {showNow && <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">NOW</span>}
        {isNext && !showNow && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">NEXT</span>}
      </div>
      
      <div className="text-center">
        <span className={`text-xl font-bold ${showNow ? 'text-orange-800' : isNext ? 'text-green-800' : 'text-gray-800'}`}>
          {formatTime(time)}
        </span>
      </div>
      
      <div className="text-center">
        <span className={`text-lg font-semibold ${showNow ? 'text-orange-700' : isNext ? 'text-green-700' : 'text-green-600'}`}>
          {renderIqamaTime(name, time)}
        </span>
      </div>
      
      <div className="text-right">
        {showNow && (
          <div className="text-sm">
            <div className="text-orange-700 font-semibold">NOW</div>
          </div>
        )}
        {isNext && !showNow && (
          <div className="text-sm">
            <div className="text-green-700 font-semibold">in {nextPrayer.countdown}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const HomePage = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer>({ name: '', time: '', countdown: '' });
  const [currentVerse, setCurrentVerse] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [islamicDate, setIslamicDate] = useState('');

  const verses = [
    { arabic: 'وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا', english: 'And whoever saves a life, it is as if he has saved all of mankind.', reference: 'Quran 5:32' },
    { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', english: 'Indeed, with hardship comes ease.', reference: 'Quran 94:6' },
    { arabic: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ', english: 'And cooperate in righteousness and piety.', reference: 'Quran 5:2' }
  ];

  // Check for logged in user and set mounted state
  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch prayer times from your existing API
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/prayers', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch prayer times');
        const data = await res.json();
        // Validate data shape
        if (!data || typeof data !== 'object' || !data.prayerTimes) {
          throw new Error('Prayer times data is missing or malformed');
        }
        setPrayerData(data);
        calculateNextPrayer(data.prayerTimes);
      } catch (error: any) {
        setError(error.message || 'Error fetching prayer times');
        setPrayerData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPrayerTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate next prayer and countdown
  const calculateNextPrayer = (times: PrayerTimes) => {
    if (!times) return;
    const now = dayjs();
    const today = now.format('YYYY-MM-DD');
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    for (const prayer of prayers) {
      const prayerTimeStr = times[prayer];
      if (!prayerTimeStr) continue;
      
      // Create full datetime for today with prayer time
      const prayerTime = dayjs(`${today} ${prayerTimeStr}`, 'YYYY-MM-DD HH:mm');
      
      if (prayerTime.isValid() && prayerTime.isAfter(now)) {
        const diff = prayerTime.diff(now);
        const d = dayjs.duration(diff);
        setNextPrayer({
          name: prayer,
          time: prayerTime.format('h:mm A'),
          countdown: `${d.hours()}h ${d.minutes()}m`
        });
        return;
      }
    }
    // If no prayer left today, set to Fajr tomorrow
    const tomorrow = now.add(1, 'day').format('YYYY-MM-DD');
    const fajrTomorrow = dayjs(`${tomorrow} ${times.Fajr}`, 'YYYY-MM-DD HH:mm');
    const diff = fajrTomorrow.diff(now);
    const d = dayjs.duration(diff);
    setNextPrayer({
      name: 'Fajr',
      time: fajrTomorrow.format('h:mm A'),
      countdown: `${d.hours()}h ${d.minutes()}m`
    });
  };

  // Update time and prayer countdown every second
  useEffect(() => {
    // Debug: verify timer effect is running
    console.log('timer effect ran');
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (prayerData?.prayerTimes) {
        calculateNextPrayer(prayerData.prayerTimes);
      }
    }, 1000);
    const verseTimer = setInterval(() => {
      setCurrentVerse((prev) => (prev + 1) % verses.length);
    }, 5000);
    return () => {
      clearInterval(timer);
      clearInterval(verseTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayerData]);

  // Islamic date calculation using API
  useEffect(() => {
    setMounted(true);
    const fetchIslamicDate = async () => {
      try {
        // Use the same aladhan API that we use for prayer times to get accurate Islamic date
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        
        const response = await fetch(`http://api.aladhan.com/v1/gToH/${day}-${month}-${year}`);
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.hijri) {
          const hijriData = data.data.hijri;
          const formattedDate = `${hijriData.day} ${hijriData.month.en} ${hijriData.year} AH`;
          setIslamicDate(formattedDate);
        } else {
          throw new Error('Failed to fetch Islamic date from API');
        }
      } catch (error) {
        console.error('Error fetching Islamic date:', error);
        // Fallback calculation with manual adjustment
        try {
          const hijri = new HijriDate();
          const hijriMonths = [
            'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani', 
            'Jumada al-Awwal', 'Jumada al-Thani',
            'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 
            'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
          ];
          
          const hijriDay = hijri.getDate();
          const hijriMonth = hijri.getMonth();
          const hijriYear = hijri.getFullYear();
          
          const formattedDate = `${hijriDay} ${hijriMonths[hijriMonth]} ${hijriYear} AH`;
          setIslamicDate(formattedDate);
        } catch (fallbackError) {
          console.error('Fallback Islamic date calculation failed:', fallbackError);
          setIslamicDate('Islamic Date Unavailable');
        }
      }
    };
    
    if (typeof window !== 'undefined') {
      fetchIslamicDate();
    }
  }, []);


  const formatTime = (time: string) => {
    if (!time) return 'Loading...';
    const parsedTime = dayjs(time, 'HH:mm');
    return parsedTime.isValid() ? parsedTime.format('h:mm A') : time;
  };

  const renderIqamaTime = (prayerName: string, athanTime: string) => {
    // First try to use API iqama times if available
    if (prayerData?.iqamaTimes?.[prayerName]) {
      const parsedTime = dayjs(prayerData.iqamaTimes[prayerName], 'HH:mm');
      if (parsedTime.isValid()) {
        return parsedTime.format('h:mm A');
      }
    }
    
    // Fallback: calculate from athan time + adjustment
    const parsedAthanTime = dayjs(athanTime, 'HH:mm');
    if (parsedAthanTime.isValid()) {
      const IQAMA_ADJUSTMENTS: { [key: string]: number } = {
        Fajr: 20,
        Dhuhr: 10,
        Asr: 10,
        Maghrib: 5,
        Isha: 10,
      };
      const adjustment = IQAMA_ADJUSTMENTS[prayerName] || 0;
      return parsedAthanTime.add(adjustment, 'minute').format('h:mm A');
    }
    
    return 'N/A';
  };


  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-6xl mx-auto border border-green-100">
            {/* Title */}
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight mb-4">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
                  MAS Queens
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-4 leading-relaxed">
                Your digital gateway to community, prayer, and spiritual growth
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-600 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{mounted ? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '--'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span className="text-green-700 font-semibold">{mounted ? islamicDate : '--'}</span>
                </div>
              </div>
            </div>

            {/* Next Prayer Countdown */}
            {!loading && !error && nextPrayer.name && (
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 mb-8 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-center gap-4">
                  <Calendar className="w-6 h-6" />
                  <div className="text-center">
                    <p className="text-green-100 text-sm">Next Prayer</p>
                    <p className="text-2xl font-bold">{nextPrayer.name} - {nextPrayer.time}</p>
                    <p className="text-green-200">in {nextPrayer.countdown}</p>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-700 rounded-xl p-4 mb-8">
                {error}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link href="/events" className="group bg-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Upcoming Events
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/volunteer" className="group bg-white text-green-800 border-2 border-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Volunteer
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        {/* Rotating Quranic Verses */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 max-w-4xl mx-auto border border-green-100">
          <div className="text-center">
            <BookOpen className="w-8 h-8 text-green-700 mx-auto mb-4" />
            <div className="transition-all duration-1000 ease-in-out">
              <p className="text-2xl md:text-3xl font-arabic text-green-800 mb-4 leading-relaxed" dir="rtl">
                {verses[currentVerse].arabic}
              </p>
              <p className="text-lg md:text-xl text-gray-700 mb-2 italic">
                &ldquo;{verses[currentVerse].english}&rdquo;
              </p>
              <p className="text-sm text-gray-500 font-semibold">
                {verses[currentVerse].reference}
              </p>
            </div>
          </div>
        </div>
        {/* Today's Prayer Schedule */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl mb-8 max-w-6xl mx-auto border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-6">
            <h2 className="text-3xl font-bold text-center mb-4">Today&apos;s Prayer Schedule</h2>
            <div className="grid grid-cols-4 gap-4 font-bold text-lg">
              <span>Prayer</span>
              <span className="text-center">Adhan</span>
              <span className="text-center">Iqamah</span>
              <span className="text-right">Status</span>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {loading ? (
              <p className="text-center text-gray-700 text-lg py-8">Loading prayer times...</p>
            ) : error ? (
              <p className="text-center text-red-600 font-semibold text-lg py-8">{error}</p>
            ) : (
              prayerData?.prayerTimes && PRAYER_NAMES.map((name) => (
                <PrayerRow 
                  key={name} 
                  name={name} 
                  time={prayerData.prayerTimes[name]}
                  prayerData={prayerData}
                  nextPrayer={nextPrayer}
                  formatTime={formatTime}
                  renderIqamaTime={renderIqamaTime}
                  currentTime={currentTime}
                />
              ))
            )}
          </div>
        </div>
        {/* Community Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <Users className="w-12 h-12 text-green-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Community Events</h3>
            <p className="text-gray-600 mb-4">Join our vibrant community activities, educational programs, and social gatherings.</p>
            <Link href="/events" className="text-green-700 font-semibold hover:text-green-800 flex items-center gap-1">
              Learn More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <Heart className="w-12 h-12 text-green-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Support Your Masjid</h3>
            <p className="text-gray-600 mb-4">Your donations help maintain our sacred space and support community programs.</p>
            <Link href="/donate" className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors inline-block">
              Donate Now
            </Link>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <BookOpen className="w-12 h-12 text-green-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Islamic Education</h3>
            <p className="text-gray-600 mb-4">Discover classes, study circles, and educational resources for all ages.</p>
            <Link href="/education" className="text-green-700 font-semibold hover:text-green-800 flex items-center gap-1">
              Explore <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        {/* Announcements Ticker */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-4">
            <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-semibold">ANNOUNCEMENTS</span>
            <div className="overflow-hidden flex-1">
              <div className="animate-marquee whitespace-nowrap">
                <span className="mx-8">📿 Ramadan preparation classes start next week</span>
                <span className="mx-8">🕌 Friday Jumu&apos;ah at 1:15 PM</span>
                <span className="mx-8">📚 Youth Islamic studies program registration open</span>
                <span className="mx-8">🤝 Community iftar this Saturday 6:30 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .font-arabic {
          font-family: &apos;Amiri&apos;, &apos;Times New Roman&apos;, serif;
        }
      `}</style>
    </div>
  );
};

export default HomePage;