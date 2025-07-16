
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Calendar, Clock, MapPin, Users, UserPlus, CheckCircle, AlertCircle, UserMinus } from 'lucide-react';
import dayjs from 'dayjs';
import CancellationModal from '@/components/CancellationModal';

interface VolunteerEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  volunteers_needed: number;
  volunteers_signed_up: number;
  category: string;
  requirements?: string;
  contact_email: string;
}

export default function VolunteerPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [signedUpEvents, setSignedUpEvents] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [cancellationModal, setCancellationModal] = useState<{
    isOpen: boolean;
    eventId: number;
    eventTitle: string;
  }>({
    isOpen: false,
    eventId: 0,
    eventTitle: ''
  });
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUser(user);
      fetchUserSignups(user.id);
    }

    fetchEvents();
  }, []);

  const fetchUserSignups = async (userId: number) => {
    try {
      const response = await fetch(`/api/user/volunteer-signups?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSignedUpEvents(data.eventIds);
      }
    } catch (error) {
      console.error('Failed to fetch user signups:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      
      if (response.ok) {
        // Filter to only show events that need volunteers
        const eventsNeedingVolunteers = data.events.filter((event: VolunteerEvent) => 
          event.volunteers_needed > 0 && event.volunteers_signed_up < event.volunteers_needed
        );
        setEvents(eventsNeedingVolunteers);
      } else {
        setMessage('Failed to load events. Please try again later.');
      }
    } catch (error) {
      setMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (eventId: number) => {
    if (!user) {
      setMessage('Please sign in to volunteer for events');
      return;
    }

    try {
      const response = await fetch('/api/volunteer/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId: eventId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh user's signups from database
        fetchUserSignups(user.id);
        
        // Display success message with Islamic quote if provided
        let successMessage = data.message || 'Successfully signed up! We will contact you with more details.';
        if (data.islamicQuote) {
          successMessage += `\n\n"${data.islamicQuote.english}" - ${data.islamicQuote.reference}`;
        }
        setMessage(successMessage);
        
        // Update event data to reflect new signup
        fetchEvents();
      } else {
        setMessage(data.error || 'Failed to sign up. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
    
    // Clear message after 8 seconds for better readability
    setTimeout(() => setMessage(''), 8000);
  };

  const handleCancelSignup = (eventId: number, eventTitle: string) => {
    setCancellationModal({
      isOpen: true,
      eventId,
      eventTitle
    });
  };

  const confirmCancellation = async () => {
    if (!user) return;

    setCancelLoading(true);
    try {
      const response = await fetch('/api/volunteer/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId: cancellationModal.eventId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh user's signups and events
        fetchUserSignups(user.id);
        fetchEvents();
        setMessage(data.message);
        setCancellationModal({ isOpen: false, eventId: 0, eventTitle: '' });
      } else {
        setMessage(data.error || 'Failed to cancel signup. Please try again.');
        // Close modal even on error to prevent stuck state
        setCancellationModal({ isOpen: false, eventId: 0, eventTitle: '' });
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      // Close modal even on network error to prevent stuck state
      setCancellationModal({ isOpen: false, eventId: 0, eventTitle: '' });
    } finally {
      setCancelLoading(false);
    }
    
    // Clear message after 5 seconds
    setTimeout(() => setMessage(''), 5000);
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">Volunteer Opportunities</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            Help make our community events successful by volunteering your time and skills
          </p>
          {!user && (
            <div className="mt-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg max-w-md mx-auto sm:mx-auto">
              <p className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <Link href="/signin" className="font-semibold hover:underline">Sign in</Link> to volunteer for events
              </p>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            <div className={`border rounded-xl shadow-lg ${
              message.includes('Successfully') 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                : 'bg-red-100 border-red-400 text-red-700'
            }`}>
              {message.includes('Successfully') ? (
                <div className="p-6">
                  {/* Success Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800">جزاک اللہ خیراً</h3>
                      <p className="text-green-700 font-medium">May Allah reward you with good!</p>
                    </div>
                  </div>
                  
                  {/* Success Message */}
                  <div className="mb-6">
                    <p className="text-green-800 font-medium text-lg leading-relaxed">
                      {message.split('\n')[0]}
                    </p>
                  </div>
                  
                  {/* Islamic Quote Section */}
                  {message.includes('"') && (
                    <div className="bg-white/70 rounded-lg p-4 border-l-4 border-green-600">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-800 mb-2 leading-relaxed">
                          {message.match(/"([^"]+)"/)?.[1]}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          — {message.match(/- ([^\n]+)/)?.[1]}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Bottom Message */}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-green-700">
                      Your volunteer signup has been confirmed. We'll contact you with more details.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading volunteer opportunities...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No volunteer opportunities available</h3>
            <p className="text-gray-500">All current events have enough volunteers or don't need volunteer help.</p>
            <p className="text-gray-500 mt-2">
              Check out our <Link href="/events" className="text-green-600 hover:underline">upcoming events</Link> or check back later for new opportunities.
            </p>
          </div>
        ) : (
          <>
            {/* Volunteer Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {events.map((event) => {
            const isSignedUp = signedUpEvents.includes(event.id);
            const spotsLeft = event.volunteers_needed - event.volunteers_signed_up;
            
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden">
                {/* Event Header */}
                <div className={`bg-gradient-to-r ${getCategoryColor(event.category)} p-4`}>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(event.category)}
                      <span className="text-sm font-medium">{event.category}</span>
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
                  </div>

                  {/* Requirements */}
                  {event.requirements && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
                      <div className="text-xs text-gray-600">
                        <p>{event.requirements}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">
                      Contact: <span className="text-green-600">{event.contact_email}</span>
                    </p>
                  </div>

                  {/* Action Button */}
                  {isSignedUp ? (
                    <div className="space-y-3">
                      <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-lg font-semibold text-center flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Signed Up!
                      </div>
                      <button
                        onClick={() => handleCancelSignup(event.id, event.title)}
                        className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 flex items-center justify-center gap-2"
                      >
                        <UserMinus className="w-4 h-4" />
                        Cancel Signup
                      </button>
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
          </>
        )}

        {/* Call to Action */}
        <div className="mt-8 sm:mt-12 text-center px-4 sm:px-0">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-green-100 max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg text-gray-600 mb-6">
              Volunteering is a beautiful way to serve our community and earn rewards from Allah (SWT). Help make our community events successful!
            </p>
            <p className="text-gray-600 mb-6">
              Want to see all community events? Visit our <Link href="/events" className="text-green-600 hover:underline font-semibold">Events Page</Link> to see what's happening at MAS Queens.
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

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={cancellationModal.isOpen}
        onClose={() => setCancellationModal({ isOpen: false, eventId: 0, eventTitle: '' })}
        onConfirm={confirmCancellation}
        type="volunteer"
        eventTitle={cancellationModal.eventTitle}
        loading={cancelLoading}
      />
    </div>
  );
}
