'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Clock, MapPin, Phone, Mail, Calendar, Heart, HandHeart, Users, BookOpen, Home, Compass, User, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const EnhancedNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true on client side
    setMounted(true);
    
    // Check for logged in user
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for storage changes (when user logs in/out in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        checkUser();
      }
    };

    // Listen for custom login/logout events
    const handleUserChange = () => {
      checkUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserChange);
    window.addEventListener('userLogout', handleUserChange);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserChange);
      window.removeEventListener('userLogout', handleUserChange);
    };
  }, []);

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
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
              <span>{mounted ? currentTime.toLocaleTimeString() : '--:--:--'}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>(718) 606-6025</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>info@masqueens.org</span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-green-600">
              <a href="https://instagram.com/masqueenscenter" target="_blank" rel="noopener noreferrer" className="hover:text-green-300 transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://facebook.com/masqueensofficial" target="_blank" rel="noopener noreferrer" className="hover:text-green-300 transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@masqueensofficial" target="_blank" rel="noopener noreferrer" className="hover:text-green-300 transition-colors" aria-label="YouTube">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://tiktok.com/@masqueensofficial" target="_blank" rel="noopener noreferrer" className="hover:text-green-300 transition-colors" aria-label="TikTok">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
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
              <img 
                src="/mas-logo.png" 
                alt="MAS Queens Logo" 
                className="w-12 h-12 object-contain"
              />
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
              {user ? (
                <Link href="/account" className="flex items-center gap-2 px-6 py-3 text-green-800 bg-green-100 font-semibold rounded-xl hover:bg-green-200 transition-all duration-300 transform hover:scale-105 border border-green-300">
                  <User className="w-5 h-5" />
                  {user.firstName}
                </Link>
              ) : (
                <Link href="/signin" className="flex items-center gap-2 px-6 py-3 text-green-800 bg-green-100 font-semibold rounded-xl hover:bg-green-200 transition-all duration-300 transform hover:scale-105 border border-green-300">
                  <Users className="w-5 h-5" />
                  Sign In
                </Link>
              )}
              <Link href="/donate" className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-green-600 to-green-700 font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <HandHeart className="w-5 h-5" />
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
                  {user ? (
                    <Link href="/account" className="w-full flex items-center justify-center gap-2 px-4 py-3 text-green-800 bg-green-100 font-semibold rounded-xl hover:bg-green-200 transition-colors">
                      <User className="w-5 h-5" />
                      {user.firstName}&apos;s Account
                    </Link>
                  ) : (
                    <Link href="/signin" className="w-full flex items-center justify-center gap-2 px-4 py-3 text-green-800 bg-green-100 font-semibold rounded-xl hover:bg-green-200 transition-colors">
                      <Users className="w-5 h-5" />
                      Sign In
                    </Link>
                  )}
                  <Link href="/donate" className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-gradient-to-r from-green-600 to-green-700 font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-colors">
                    <HandHeart className="w-5 h-5" />
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