'use client';

import React, { useState } from 'react';
import { Share2, X } from 'lucide-react';

// Social media icons (same as footer)
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

const SocialSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const socialMediaLinks = [
    {
      name: 'Instagram',
      url: 'https://instagram.com/masqueenscenter',
      icon: InstagramIcon,
      color: 'hover:bg-pink-500 hover:text-white',
      bgColor: 'bg-pink-50'
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@masqueensofficial',
      icon: TikTokIcon,
      color: 'hover:bg-black hover:text-white',
      bgColor: 'bg-gray-50'
    },
    {
      name: 'Facebook',
      url: 'https://facebook.com/masqueensofficial',
      icon: FacebookIcon,
      color: 'hover:bg-blue-600 hover:text-white',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@masqueensofficial',
      icon: YouTubeIcon,
      color: 'hover:bg-red-600 hover:text-white',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden">
        {!isExpanded ? (
          // Collapsed state - just the share button
          <button
            onClick={() => setIsExpanded(true)}
            className="w-12 h-12 flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
            aria-label="Show social media links"
          >
            <Share2 className="w-5 h-5" />
          </button>
        ) : (
          // Expanded state - show all social links
          <div className="py-2">
            {/* Close button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors border-b border-gray-100"
              aria-label="Hide social media links"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Social links */}
            {socialMediaLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 flex items-center justify-center text-gray-600 transition-all duration-300 ${social.color} ${social.bgColor}`}
                  aria-label={`Follow us on ${social.name}`}
                  title={`Follow us on ${social.name}`}
                >
                  <IconComponent className="w-5 h-5" />
                </a>
              );
            })}
            
            {/* Handle */}
            <div className="px-3 py-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">@masqueensofficial</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialSidebar;