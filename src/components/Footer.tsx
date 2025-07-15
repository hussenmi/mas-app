'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Heart } from 'lucide-react';

// Custom social media icons as SVG components
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const Footer = () => {
  const socialMediaLinks = [
    {
      name: 'Instagram',
      url: 'https://instagram.com/masqueenscenter',
      icon: InstagramIcon,
      color: 'hover:text-pink-500'
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@masqueensofficial',
      icon: TikTokIcon,
      color: 'hover:text-black'
    },
    {
      name: 'Facebook',
      url: 'https://facebook.com/masqueensofficial',
      icon: FacebookIcon,
      color: 'hover:text-blue-600'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@masqueensofficial',
      icon: YouTubeIcon,
      color: 'hover:text-red-600'
    }
  ];

  return (
    <footer className="bg-gradient-to-r from-green-800 to-green-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-green-300" />
                <div>
                  <p>46-01 20th Ave</p>
                  <p>Astoria, NY 11105</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-300" />
                <p>(718) 606-6025</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-300" />
                <p>info@masqueens.org</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link href="/events" className="block text-green-100 hover:text-white transition-colors">
                Events
              </Link>
              <Link href="/volunteer" className="block text-green-100 hover:text-white transition-colors">
                Volunteer
              </Link>
              <Link href="/donate" className="block text-green-100 hover:text-white transition-colors">
                Donate
              </Link>
              <Link href="/account" className="block text-green-100 hover:text-white transition-colors">
                My Account
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            
            {/* Social Media Links */}
            <div className="space-y-3">
              <p className="text-green-200 text-sm">Follow us on social media:</p>
              <div className="flex gap-4">
                {socialMediaLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-8 h-8 text-green-200 ${social.color} transition-all duration-300 transform hover:scale-110`}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <IconComponent className="w-full h-full" />
                    </a>
                  );
                })}
              </div>
              {/* <p className="text-xs text-green-300">@masqueensofficial</p> */}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-green-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="flex items-center gap-4">
              <p className="text-green-200">
                © 2025 MAS Queens. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-1 text-green-200">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400" />
              <span>for the community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;