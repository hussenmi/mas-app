'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, Clock, MapPin, Users, ExternalLink, Heart, BookOpen } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizer: string;
  capacity?: number;
  registeredCount?: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Sample events data - replace with actual API call
    const sampleEvents: Event[] = [
    {
      id: '1',
      title: 'Jumuah Prayer',
      description: 'Weekly Friday congregational prayer with Islamic sermon.',
      date: '2024-01-19',
      time: '13:15',
      location: 'Main Prayer Hall',
      category: 'Prayer',
      organizer: 'MAS Queens',
      capacity: 200,
      registeredCount: 0
    },
    {
      id: '2',
      title: 'Youth Halaqa',
      description: 'Weekly study circle for young Muslims focusing on Quran and Hadith.',
      date: '2024-01-20',
      time: '18:00',
      location: 'Education Room A',
      category: 'Education',
      organizer: 'Youth Committee',
      capacity: 25,
      registeredCount: 18
    },
    {
      id: '3',
      title: 'Community Iftar',
      description: 'Join us for a community iftar dinner during Ramadan.',
      date: '2024-01-21',
      time: '18:30',
      location: 'Community Hall',
      category: 'Community',
      organizer: 'MAS Queens',
      capacity: 100,
      registeredCount: 75
    },
    {
      id: '4',
      title: 'Monthly Food Drive',
      description: 'Help us collect food donations for local families in need.',
      date: '2024-01-22',
      time: '10:00',
      location: 'Parking Lot',
      category: 'Service',
      organizer: 'Social Services Committee',
      capacity: 50,
      registeredCount: 35
    },
    {
      id: '5',
      title: 'Sisters Circle',
      description: 'Monthly gathering for sisters to discuss Islamic topics and community matters.',
      date: '2024-01-23',
      time: '19:00',
      location: 'Education Room B',
      category: 'Community',
      organizer: 'Sisters Committee',
      capacity: 30,
      registeredCount: 22
    }
  ];

    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(sampleEvents);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const categories = ['all', 'Prayer', 'Education', 'Community', 'Service'];
  
  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Prayer': return <Calendar className="w-5 h-5" />;
      case 'Education': return <BookOpen className="w-5 h-5" />;
      case 'Community': return <Users className="w-5 h-5" />;
      case 'Service': return <Heart className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prayer': return 'from-green-500 to-green-600';
      case 'Education': return 'from-blue-500 to-blue-600';
      case 'Community': return 'from-purple-500 to-purple-600';
      case 'Service': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our vibrant community activities, educational programs, and spiritual gatherings
          </p>
        </div>

        {/* Category Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
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
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                  {/* Event Header */}
                  <div className={`bg-gradient-to-r ${getCategoryColor(event.category)} p-4 rounded-t-xl`}>
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(event.category)}
                        <span className="text-sm font-medium">{event.category}</span>
                      </div>
                      <ExternalLink className="w-4 h-4" />
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
                        <span>Organized by {event.organizer}</span>
                      </div>
                    </div>

                    {/* Capacity Info */}
                    {event.capacity && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Registered</span>
                          <span>{event.registeredCount}/{event.capacity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((event.registeredCount! / event.capacity) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      Register / Learn More
                    </button>
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
    </div>
  );
}