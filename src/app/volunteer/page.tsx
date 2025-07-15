
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Calendar, Clock, MapPin, Users, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';

interface VolunteerEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  volunteersNeeded: number;
  volunteersSignedUp: number;
  category: string;
  requirements?: string[];
  contact: string;
}

export default function VolunteerPage() {
  const [user, setUser] = useState<any>(null);
  const [signedUpEvents, setSignedUpEvents] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  const volunteerEvents: VolunteerEvent[] = [
    {
      id: '1',
      title: 'Friday Jumu\'ah Setup & Cleanup',
      description: 'Help set up chairs, prayer rugs, and clean up after Friday prayers. Great for new volunteers!',
      date: '2024-01-19',
      time: '12:00',
      location: 'Main Prayer Hall',
      volunteersNeeded: 8,
      volunteersSignedUp: 5,
      category: 'Prayer Support',
      requirements: ['Punctuality', 'Physical ability to move chairs'],
      contact: 'operations@masqueens.org'
    },
    {
      id: '2',
      title: 'Community Food Drive Coordination',
      description: 'Organize and distribute food packages to local families in need. Help make a direct impact!',
      date: '2024-01-22',
      time: '09:00',
      location: 'Community Center',
      volunteersNeeded: 12,
      volunteersSignedUp: 8,
      category: 'Community Service',
      requirements: ['Organizational skills', 'Compassionate attitude', 'Ability to lift 20+ lbs'],
      contact: 'outreach@masqueens.org'
    },
    {
      id: '3',
      title: 'Youth Islamic Studies Teaching Assistant',
      description: 'Assist teachers with weekend Islamic studies classes for children ages 6-12.',
      date: '2024-01-20',
      time: '15:00',
      location: 'Education Wing',
      volunteersNeeded: 4,
      volunteersSignedUp: 2,
      category: 'Education',
      requirements: ['Good with children', 'Basic Islamic knowledge', 'Background check required'],
      contact: 'education@masqueens.org'
    },
    {
      id: '4',
      title: 'Ramadan Iftar Preparation',
      description: 'Help prepare and serve community iftar meals during Ramadan. Join our kitchen team!',
      date: '2024-01-25',
      time: '16:00',
      location: 'Community Kitchen',
      volunteersNeeded: 15,
      volunteersSignedUp: 12,
      category: 'Food Service',
      requirements: ['Food handling experience preferred', 'Ability to stand for long periods'],
      contact: 'kitchen@masqueens.org'
    },
    {
      id: '5',
      title: 'Masjid Garden Maintenance',
      description: 'Help maintain the beautiful garden areas around the masjid. Perfect for nature lovers!',
      date: '2024-01-21',
      time: '10:00',
      location: 'Masjid Grounds',
      volunteersNeeded: 6,
      volunteersSignedUp: 3,
      category: 'Maintenance',
      requirements: ['Comfortable working outdoors', 'Basic gardening knowledge helpful'],
      contact: 'facilities@masqueens.org'
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Load signed up events from localStorage
    const savedSignups = localStorage.getItem('volunteerSignups');
    if (savedSignups) {
      setSignedUpEvents(JSON.parse(savedSignups));
    }
  }, []);

  const handleSignUp = (eventId: string) => {
    if (!user) {
      setMessage('Please sign in to volunteer for events');
      return;
    }

    const newSignups = [...signedUpEvents, eventId];
    setSignedUpEvents(newSignups);
    localStorage.setItem('volunteerSignups', JSON.stringify(newSignups));
    setMessage('Successfully signed up! We will contact you with more details.');
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Prayer Support': return <Heart className="w-5 h-5" />;
      case 'Community Service': return <Users className="w-5 h-5" />;
      case 'Education': return <Calendar className="w-5 h-5" />;
      case 'Food Service': return <Heart className="w-5 h-5" />;
      case 'Maintenance': return <MapPin className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prayer Support': return 'from-green-500 to-green-600';
      case 'Community Service': return 'from-blue-500 to-blue-600';
      case 'Education': return 'from-purple-500 to-purple-600';
      case 'Food Service': return 'from-orange-500 to-orange-600';
      case 'Maintenance': return 'from-teal-500 to-teal-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Volunteer Opportunities</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our community and make a meaningful impact through volunteer service
          </p>
          {!user && (
            <div className="mt-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg max-w-md mx-auto">
              <p className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <Link href="/signin" className="font-semibold hover:underline">Sign in</Link> to volunteer for events
              </p>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-8 max-w-md mx-auto">
            <div className={`border px-4 py-3 rounded-lg ${
              message.includes('Successfully') 
                ? 'bg-green-100 border-green-400 text-green-700'
                : 'bg-red-100 border-red-400 text-red-700'
            }`}>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Volunteer Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteerEvents.map((event) => {
            const isSignedUp = signedUpEvents.includes(event.id);
            const spotsLeft = event.volunteersNeeded - event.volunteersSignedUp;
            
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden">
                {/* Event Header */}
                <div className={`bg-gradient-to-r ${getCategoryColor(event.category)} p-4`}>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(event.category)}
                      <span className="text-sm font-medium">{event.category}</span>
                    </div>
                    <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                      {spotsLeft} spots left
                    </div>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{event.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{dayjs(event.date).format('dddd, MMMM D, YYYY')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{dayjs(`${event.date} ${event.time}`).format('h:mm A')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{event.volunteersSignedUp}/{event.volunteersNeeded} volunteers</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((event.volunteersSignedUp / event.volunteersNeeded) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Requirements */}
                  {event.requirements && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {event.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">
                      Contact: <span className="text-green-600">{event.contact}</span>
                    </p>
                  </div>

                  {/* Action Button */}
                  {isSignedUp ? (
                    <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-lg font-semibold text-center flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Signed Up!
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleSignUp(event.id)}
                      disabled={!user || spotsLeft === 0}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                        !user || spotsLeft === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      {spotsLeft === 0 ? 'Event Full' : 'Sign Up to Volunteer'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg text-gray-600 mb-6">
              Volunteering is a beautiful way to serve our community and earn rewards from Allah (SWT).
            </p>
            {!user ? (
              <div className="space-y-4">
                <Link href="/signin" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <UserPlus className="w-5 h-5" />
                  Sign In to Get Started
                </Link>
                <p className="text-sm text-gray-500">
                  Don&apos;t have an account? <Link href="/signup" className="text-green-600 hover:underline">Create one here</Link>
                </p>
              </div>
            ) : (
              <Link href="/account" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <Heart className="w-5 h-5" />
                Update Your Volunteer Preferences
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
