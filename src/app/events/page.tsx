'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, Clock, MapPin, Users, ExternalLink, Heart, BookOpen, CheckCircle, X, UserMinus } from 'lucide-react';
import CancellationModal from '@/components/CancellationModal';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  volunteers_needed: number;
  volunteers_signed_up: number;
  requirements?: string;
  contact_email: string;
  price: number;
  total_rsvps: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [user, setUser] = useState<any>(null);
  const [rsvpedEvents, setRsvpedEvents] = useState<number[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState<{ [key: number]: boolean }>({});
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
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
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUser(user);
      fetchUserRsvps(user.id);
    }
    
    fetchEvents();
  }, []);

  const handleRsvp = async (eventId: number, eventPrice: number) => {
    if (!user) {
      window.location.href = '/signin';
      return;
    }

    // If it's a paid event, redirect to payment page
    if (eventPrice > 0) {
      window.location.href = `/events/${eventId}/payment`;
      return;
    }

    // For free events, proceed with RSVP
    setRsvpLoading(prev => ({ ...prev, [eventId]: true }));

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh user's RSVPs and events data
        fetchUserRsvps(user.id);
        fetchEvents();
        
        // Show success notification
        setNotification({ message: data.message, type: 'success' });
        setTimeout(() => setNotification(null), 5000);
      } else {
        setNotification({ message: data.error || 'Failed to RSVP. Please try again.', type: 'error' });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      setNotification({ message: 'Network error. Please try again.', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setRsvpLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleCancelRsvp = (eventId: number, eventTitle: string) => {
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
      const response = await fetch(`/api/events/${cancellationModal.eventId}/cancel-rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh user's RSVPs and events
        fetchUserRsvps(user.id);
        fetchEvents();
        setNotification({ message: data.message, type: 'success' });
        setCancellationModal({ isOpen: false, eventId: 0, eventTitle: '' });
      } else {
        setNotification({ message: data.error || 'Failed to cancel RSVP. Please try again.', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setCancelLoading(false);
    }
    
    // Clear notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchUserRsvps = async (userId: number) => {
    try {
      const response = await fetch(`/api/user/event-rsvps?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setRsvpedEvents(data.eventIds);
      }
    } catch (error) {
      console.error('Failed to fetch user RSVPs:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events);
      } else {
        setError('Failed to load events. Please try again later.');
      }
    } catch (err: any) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Prayer Support', 'Community Service', 'Education', 'Food Service', 'Maintenance', 'Youth Programs', 'Fundraising', 'Administrative'];
  
  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Prayer Support': return <Calendar className="w-5 h-5" />;
      case 'Community Service': return <Users className="w-5 h-5" />;
      case 'Education': return <BookOpen className="w-5 h-5" />;
      case 'Food Service': return <Heart className="w-5 h-5" />;
      case 'Maintenance': return <ExternalLink className="w-5 h-5" />;
      case 'Youth Programs': return <Users className="w-5 h-5" />;
      case 'Fundraising': return <Heart className="w-5 h-5" />;
      case 'Administrative': return <Calendar className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prayer Support': return 'from-green-500 to-green-600';
      case 'Community Service': return 'from-blue-500 to-blue-600';
      case 'Education': return 'from-purple-500 to-purple-600';
      case 'Food Service': return 'from-orange-500 to-orange-600';
      case 'Maintenance': return 'from-teal-500 to-teal-600';
      case 'Youth Programs': return 'from-pink-500 to-pink-600';
      case 'Fundraising': return 'from-yellow-500 to-yellow-600';
      case 'Administrative': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8 px-4">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-red-600" />
            )}
            <p className="flex-1 text-sm font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification(null)}
              className={`ml-2 ${
                notification.type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">Upcoming Events</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            Join our vibrant community activities, educational programs, and spiritual gatherings
          </p>
        </div>

        {/* Category Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {category === 'all' ? 'All Events' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-green-100">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-semibold text-lg">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                  {/* Event Header */}
                  <div className={`bg-gradient-to-r ${getCategoryColor(event.category)} p-4 rounded-t-xl`}>
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
                    
                    {event.description && (
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{event.description}</p>
                    )}

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
                        <span>Contact: {event.contact_email}</span>
                      </div>
                    </div>


                    {/* Requirements */}
                    {event.requirements && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Additional Info:</h4>
                        <p className="text-xs text-gray-600">{event.requirements}</p>
                      </div>
                    )}

                    {/* Price Info */}
                    {event.price > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-sm font-semibold text-yellow-800">
                          Event Price: ${event.price.toFixed(2)}
                        </div>
                      </div>
                    )}


                    {/* Action Button */}
                    <div>
                      {rsvpedEvents.includes(event.id) ? (
                        <div className="space-y-3">
                          <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-lg font-semibold text-center flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            You're attending!
                          </div>
                          <button
                            onClick={() => handleCancelRsvp(event.id, event.title)}
                            className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 flex items-center justify-center gap-2"
                          >
                            <UserMinus className="w-4 h-4" />
                            Cancel RSVP
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleRsvp(event.id, event.price)}
                          disabled={rsvpLoading[event.id] || !user}
                          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                            !user
                              ? 'bg-gray-300 text-gray-600 cursor-pointer'
                              : rsvpLoading[event.id]
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : event.price > 0
                                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800'
                                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          {rsvpLoading[event.id] 
                            ? 'Processing...' 
                            : !user 
                              ? 'Sign in to RSVP'
                              : event.price > 0 
                                ? `RSVP ($${event.price.toFixed(2)})` 
                                : 'RSVP (Free)'
                          }
                        </button>
                      )}
                    </div>

                    {/* Volunteer Link */}
                    {event.volunteers_needed > 0 && event.volunteers_signed_up < event.volunteers_needed && (
                      <div className="mt-3 text-center">
                        <a 
                          href="/volunteer" 
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          This event needs volunteers →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No events found for the selected category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={cancellationModal.isOpen}
        onClose={() => setCancellationModal({ isOpen: false, eventId: 0, eventTitle: '' })}
        onConfirm={confirmCancellation}
        type="rsvp"
        eventTitle={cancellationModal.eventTitle}
        loading={cancelLoading}
      />
    </div>
  );
}