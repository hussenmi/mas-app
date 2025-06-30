'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Heart, Users, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const HomePage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState({ name: '', time: '', countdown: '' });
  const [currentVerse, setCurrentVerse] = useState(0);
  const [loading, setLoading] = useState(true);

  const verses = [
    { arabic: 'وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا', english: 'And whoever saves a life, it is as if he has saved all of mankind.', reference: 'Quran 5:32' },
    { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', english: 'Indeed, with hardship comes ease.', reference: 'Quran 94:6' },
    { arabic: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ', english: 'And cooperate in righteousness and piety.', reference: 'Quran 5:2' }
  ];

  // Fetch prayer times from your existing API
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const res = await fetch('/api/prayers');
        if (res.ok) {
          const data = await res.json();
          setPrayerTimes(data);
          calculateNextPrayer(data);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, []);

  // Calculate next prayer and countdown
  const calculateNextPrayer = (times: PrayerTimes) => {
    if (!times) return;

    const now = dayjs();
    let nextPrayerInfo = null;

    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (const prayerName of prayerOrder) {
      const prayerTime = dayjs(times[prayerName as keyof PrayerTimes], 'HH:mm');

      if (prayerTime.isAfter(now)) {
        nextPrayerInfo = { name: prayerName, time: prayerTime };
        break;
      }
    }

    if (!nextPrayerInfo) {
      const fajrTomorrow = dayjs(times.Fajr, 'HH:mm').add(1, 'day');
      nextPrayerInfo = { name: 'Fajr', time: fajrTomorrow };
    }

    const diff = nextPrayerInfo.time.diff(now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    setNextPrayer({
      name: nextPrayerInfo.name,
      time: nextPrayerInfo.time.format('h:mm A'),
      countdown: `${hours}h ${minutes}m`,
    });
  };

  // Update time and prayer countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (prayerTimes) {
        calculateNextPrayer(prayerTimes);
      }
    }, 1000);

    const verseTimer = setInterval(() => {
      setCurrentVerse((prev) => (prev + 1) % verses.length);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(verseTimer);
    };
  }, [prayerTimes, verses.length]);

  const formatTime = (time: string) => {
    if (!time) return 'Loading...';
    const parsedTime = dayjs(time, 'HH:mm');
    return parsedTime.isValid() ? parsedTime.format('h:mm A') : time;
  };

  const GeometricPattern = () => (
    <div className="absolute inset-0 opacity-5 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamicPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <g fill="currentColor" className="text-green-800">
              <circle cx="50" cy="50" r="20" fillOpacity="0.1"/>
              <polygon points="50,30 65,45 50,60 35,45" fillOpacity="0.1"/>
              <rect x="40" y="40" width="20" height="20" fillOpacity="0.05" transform="rotate(45 50 50)"/>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamicPattern)"/>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden">
      <GeometricPattern />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with Live Time */}
        <div className="text-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-6xl mx-auto border border-green-100">
            <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Queens, NY</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-800 leading-tight mb-4">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
                MAS Queens
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Your digital gateway to community, prayer, and spiritual growth
            </p>

            {/* Next Prayer Countdown */}
            {!loading && nextPrayer.name && (
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link href="/prayers" className="group bg-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                View Prayer Times
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/events" className="group bg-white text-green-800 border-2 border-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Upcoming Events
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
                &quot;{verses[currentVerse].english}&quot;
              </p>
              <p className="text-sm text-gray-500 font-semibold">
                {verses[currentVerse].reference}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Prayer Schedule */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 max-w-4xl mx-auto border border-green-100">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Today&apos;s Prayer Schedule</h2>
          {loading ? (
            <p className="text-center text-gray-600">Loading prayer times...</p>
          ) : prayerTimes ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(prayerTimes).map(([prayer, time]) => (
                <div key={prayer} className="text-center p-4 rounded-xl bg-gradient-to-b from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105">
                  <p className="font-semibold text-gray-700 mb-1">{prayer}</p>
                  <p className="text-lg font-bold text-green-800">{formatTime(time as string)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-red-600">Unable to load prayer times</p>
          )}
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
          font-family: 'Amiri', 'Times New Roman', serif;
        }
      `}</style>
    </div>
  );
};

export default HomePage;