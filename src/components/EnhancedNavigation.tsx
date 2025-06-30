'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Clock, MapPin, Phone, Mail, Calendar, Heart, Users, BookOpen, Home, Compass } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const EnhancedNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState({ name: 'Maghrib', time: '6:45 PM' });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Fetch next prayer time from your API
    const fetchNextPrayer = async () => {
      try {
        const res = await fetch('/api/prayers');
        if (res.ok) {
          const data = await res.json();
          // Calculate next prayer logic here
          // This is simplified - you can implement the same logic from the prayer page
          setNextPrayer({ name: 'Maghrib', time: '6:45 PM' }); // Replace with actual calculation
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      }
    };

    fetchNextPrayer();

    return () => clearInterval(timer);
  }, []);

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Prayer Times', href: '/prayers', icon: Clock },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Education', href: '/education', icon: BookOpen },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Volunteer', href: '/volunteer', icon: Heart },
  ];

  return (
    <>
      {/* Top Info Bar */}
      <div className="bg-gradient-to-r from-green-800 to-green-900 text-white py-2 px-4 text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>Next: {nextPrayer.name} at {nextPrayer.time}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>(718) 555-0123</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>info@masqueens.org</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-green-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-xl">🕌</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">MAS Queens</h1>
                <p className="text-sm text-green-600">Connect • Grow • Serve</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 font-semibold hover:text-green-800 hover:bg-green-50 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link href="/signin" className="flex items-center gap-2 px-6 py-3 text-green-800 bg-green-100 font-semibold rounded-xl hover:bg-green-200 transition-all duration-300 transform hover:scale-105 border border-green-300">
                <Users className="w-5 h-5" />
                Sign In
              </Link>
              <Link href="/donate" className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-green-600 to-green-700 font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <Heart className="w-5 h-5" />
                Donate
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-green-100 hover:bg-green-200 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-green-800" />
              ) : (
                <Menu className="w-6 h-6 text-green-800" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-green-100 shadow-xl">
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-3">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 font-semibold hover:text-green-800 hover:bg-green-50 rounded-xl transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <Link href="/signin" className="w-full flex items-center justify-center gap-2 px-4 py-3 text-green-800 bg-green-100 font-semibold rounded-xl hover:bg-green-200 transition-colors">
                    <Users className="w-5 h-5" />
                    Sign In
                  </Link>
                  <Link href="/donate" className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-gradient-to-r from-green-600 to-green-700 font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-colors">
                    <Heart className="w-5 h-5" />
                    Donate
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default EnhancedNavigation;