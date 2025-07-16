'use client';

import { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';

export const PerformanceIndicator = () => {
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [cacheHits, setCacheHits] = useState(0);

  useEffect(() => {
    // Measure page load time
    const startTime = performance.now();
    
    const handleLoad = () => {
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Check for cache hits
    const checkCacheHits = () => {
      let hits = 0;
      if (localStorage.getItem('announcements-cache')) hits++;
      
      // Check for any islamic-date cache (with date-specific keys)
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const dateKey = `${day}-${month}-${year}`;
      if (localStorage.getItem(`islamic-date-cache-${dateKey}`)) hits++;
      
      setCacheHits(hits);
    };

    checkCacheHits();
    const interval = setInterval(checkCacheHits, 1000);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearInterval(interval);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 left-4 bg-slate-800 text-white p-3 rounded-lg border border-slate-600 text-xs z-50">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-3 h-3 text-green-400" />
        <span className="font-semibold">Performance</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Load: {loadTime ? `${loadTime.toFixed(0)}ms` : 'Loading...'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400">📦</span>
          <span>Cache hits: {cacheHits}/2</span>
        </div>
      </div>
    </div>
  );
};