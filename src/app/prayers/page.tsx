'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Clock, Compass, Calendar, MapPin, Sunset, Moon, Sun, Bell } from 'lucide-react';

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

// Prayer icons
const PRAYER_ICONS: { [key: string]: any } = {
  Fajr: Moon,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

export default function PrayersPage() {
  const [times, setTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<{ name: string; timeLeft: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [qiblaDirection] = useState(58); // Degrees for Queens, NY
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Fetch prayer times from your existing API
  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const res = await fetch('/api/prayers');
        if (!res.ok) {
          throw new Error('Prayer times could not be loaded at this moment.');
        }
        const data = await res.json();
        setTimes(data);
        calculateNextPrayer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTimes();
  }, []);

  // Calculate next prayer and time remaining
  const calculateNextPrayer = (prayerTimes: any) => {
    if (!prayerTimes) return;

    const now = dayjs();
    for (const prayer of PRAYER_NAMES) {
      const prayerTime = dayjs(prayerTimes[prayer], 'HH:mm');
      if (prayerTime.isAfter(now)) {
        const diff = prayerTime.diff(now);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setNextPrayer({
          name: prayer,
          timeLeft: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        });
        return;
      }
    }

    // If no prayer today, set to Fajr tomorrow
    const fajrTomorrow = dayjs(prayerTimes.Fajr, 'HH:mm').add(1, 'day');
    const diff = fajrTomorrow.diff(now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setNextPrayer({
      name: 'Fajr',
      timeLeft: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    });
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (times) {
        calculateNextPrayer(times);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [times]);

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

  const islamicDate = "15 Jumada al-Awwal 1446"; // You can make this dynamic too

  const QiblaCompass = () => (
    <div className="relative w-32 h-32 mx-auto">
      <div className="absolute inset-0 rounded-full border-4 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
        <div className="absolute inset-2 rounded-full border-2 border-green-300">
          <div 
            className="absolute top-1 left-1/2 w-1 h-6 bg-red-500 transform -translate-x-1/2 origin-bottom transition-transform duration-300"
            style={{ transform: `translateX(-50%) rotate(${qiblaDirection}deg)` }}
          />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-600 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600">N</div>
      <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 text-xs font-bold text-gray-600">E</div>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600">S</div>
      <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 text-xs font-bold text-gray-600">W</div>
    </div>
  );

  const PrayerRow = ({ name, time, isNext = false }: { name: string; time: string; isNext?: boolean }) => {
    const IconComponent = PRAYER_ICONS[name] || Clock;
    
    return (
      <div className={`grid grid-cols-4 gap-4 items-center py-4 px-6 rounded-xl transition-all duration-300 ${
        isNext 
          ? 'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-400 shadow-lg transform scale-105' 
          : 'bg-white/70 hover:bg-white/90 border border-green-100'
      }`}>
        <div className="flex items-center gap-3">
          <IconComponent className={`w-6 h-6 ${isNext ? 'text-green-700' : 'text-green-600'}`} />
          <span className={`text-lg font-semibold ${isNext ? 'text-green-800' : 'text-gray-700'}`}>
            {name}
          </span>
          {isNext && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">NEXT</span>}
        </div>
        
        <div className="text-center">
          <span className={`text-xl font-bold ${isNext ? 'text-green-800' : 'text-gray-800'}`}>
            {renderTime(time)}
          </span>
        </div>
        
        <div className="text-center">
          <span className={`text-lg font-semibold ${isNext ? 'text-green-700' : 'text-green-600'}`}>
            {renderIqamaTime(name, time)}
          </span>
        </div>
        
        <div className="text-right">
          {isNext && nextPrayer && (
            <div className="text-sm">
              <div className="text-green-700 font-semibold">in {nextPrayer.timeLeft}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Prayer Times</h1>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{islamicDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Queens, NY</span>
              </div>
            </div>
            
            {/* Current Time Display */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 mb-6">
              <div className="flex justify-center items-center gap-4">
                <Clock className="w-8 h-8" />
                <div className="text-center">
                  <div className="text-3xl font-bold">{currentTime.toLocaleTimeString()}</div>
                  <div className="text-green-200">Current Time</div>
                </div>
              </div>
            </div>

            <p className="text-green-700 font-semibold">
              Calculation Method: ISNA (Islamic Society of North America)
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 mb-8">
          {/* Prayer Times Table */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-6">
                <div className="grid grid-cols-4 gap-4 font-bold text-lg">
                  <span>Prayer</span>
                  <span className="text-center">Adhan</span>
                  <span className="text-center">Iqamah</span>
                  <span className="text-right">Status</span>
                </div>
              </div>
              
              {/* Prayer Rows */}
              <div className="p-4 space-y-3">
                {loading ? (
                  <p className="text-center text-gray-700 text-lg py-8">Loading prayer times...</p>
                ) : error ? (
                  <p className="text-center text-red-600 font-semibold text-lg py-8">{error}</p>
                ) : (
                  times && PRAYER_NAMES.map((name) => (
                    <PrayerRow 
                      key={name} 
                      name={name} 
                      time={times[name]}
                      isNext={nextPrayer?.name === name}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Qibla Compass */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                <Compass className="w-6 h-6 text-green-700" />
                Qibla Direction
              </h3>
              <QiblaCompass />
              <p className="text-sm text-gray-600 mt-4">
                {qiblaDirection}° from North
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Pointing towards Makkah
              </p>
            </div>

            {/* Next Prayer Countdown */}
            {nextPrayer && (
              <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold mb-4 text-center">Next Prayer</h3>
                <div className="text-center">
                  <div className="text-2xl font-bold">{nextPrayer.name}</div>
                  <div className="text-3xl font-mono my-2">{nextPrayer.timeLeft}</div>
                  <div className="text-green-200 text-sm">remaining</div>
                </div>
              </div>
            )}

            {/* Prayer Notifications */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Prayer Reminders</h3>
              <button 
                onClick={enableNotifications}
                className={`w-full py-3 rounded-xl font-semibold transition-colors mb-3 flex items-center justify-center gap-2 ${
                  notificationsEnabled 
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                <Bell className="w-4 h-4" />
                {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
              </button>
              <p className="text-xs text-gray-600 text-center">
                Get notified before each prayer time
              </p>
            </div>

            {/* Masjid Info */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🕌 Masjid Information</h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <p><strong>Address:</strong> 123 Main St, Queens, NY</p>
                <p><strong>Phone:</strong> (718) 555-0123</p>
                <p><strong>Imam:</strong> Sheikh Abdul Rahman</p>
                <p><strong>Jumu&apos;ah:</strong> 1:15 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📖 Prayer Guidelines</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Wudu (ablution) is required before each prayer</li>
              <li>• Face the Qibla direction when praying</li>
              <li>• Friday Jumu&apos;ah prayer replaces Dhuhr</li>
              <li>• Iqamah is called 5-20 minutes after Adhan</li>
            </ul>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">⏰ Prayer Time Adjustments</h3>
            <div className="space-y-2 text-gray-600 text-sm">
              <p><strong>Fajr Iqamah:</strong> +30 minutes</p>
              <p><strong>Dhuhr Iqamah:</strong> +20 minutes</p>
              <p><strong>Asr Iqamah:</strong> +10 minutes</p>
              <p><strong>Maghrib Iqamah:</strong> +5 minutes</p>
              <p><strong>Isha Iqamah:</strong> +10 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}