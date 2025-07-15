'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Phone,
  User,
  Edit3,
  AlertCircle,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  volunteers_needed: number;
  actual_signups: number;
  category: string;
  requirements: string;
  contact_email: string;
  status: string;
  created_by_name: string;
  created_at: string;
}

interface Volunteer {
  signup_id: number;
  status: string;
  signed_up_at: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  emergency_contact: string;
}

const EventDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check admin auth
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin/signin');
      return;
    }

    if (eventId) {
      fetchEventDetails();
      fetchVolunteers();
    }
  }, [eventId, router]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      const data = await response.json();
      
      if (response.ok) {
        setEvent(data.event);
      } else {
        setError(data.error || 'Failed to fetch event details');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/volunteers`);
      const data = await response.json();
      
      if (response.ok) {
        setVolunteers(data.volunteers);
      } else {
        setError(data.error || 'Failed to fetch volunteers');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prayer Support': return 'bg-green-100 text-green-800';
      case 'Community Service': return 'bg-blue-100 text-blue-800';
      case 'Education': return 'bg-purple-100 text-purple-800';
      case 'Food Service': return 'bg-orange-100 text-orange-800';
      case 'Maintenance': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error || 'Event not found'}</p>
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const spotsLeft = event.volunteers_needed - event.actual_signups;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{event.title}</h1>
              <p className="text-slate-400">Event Details & Volunteers</p>
            </div>
            
            <div className="flex gap-4">
              <Link
                href="/admin/events"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Events
              </Link>
              <Link
                href={`/admin/events/${eventId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Event Details */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Event Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm">Category</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Date & Time</label>
                  <div className="flex items-center gap-2 text-white mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{dayjs(event.date).format('MMMM D, YYYY')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{dayjs(`${event.date} ${event.time}`).format('h:mm A')}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Location</label>
                  <div className="flex items-center gap-2 text-white mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Contact</label>
                  <div className="flex items-center gap-2 text-white mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{event.contact_email}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Description</label>
                  <p className="text-white mt-1">{event.description}</p>
                </div>

                {event.requirements && (
                  <div>
                    <label className="text-slate-400 text-sm">Requirements</label>
                    <p className="text-white mt-1">{event.requirements}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Volunteer Stats */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mt-6">
              <h2 className="text-lg font-semibold text-white mb-4">Volunteer Status</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Volunteers Needed</span>
                  <span className="text-white font-semibold">{event.volunteers_needed}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Signed Up</span>
                  <span className="text-white font-semibold">{event.actual_signups}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Spots Left</span>
                  <span className={`font-semibold ${spotsLeft === 0 ? 'text-red-400' : spotsLeft <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {spotsLeft}
                  </span>
                </div>

                <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((event.actual_signups / event.volunteers_needed) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Volunteers List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl border border-slate-700">
              <div className="px-6 py-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Registered Volunteers</h2>
                  <div className="flex items-center gap-2 text-slate-400">
                    <UserCheck className="w-4 h-4" />
                    <span>{volunteers.length} volunteer{volunteers.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              
              {volunteers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No volunteers yet</h3>
                  <p className="text-slate-400">Volunteers will appear here when they sign up for this event.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Volunteer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Emergency Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Signed Up
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {volunteers.map((volunteer) => (
                        <tr key={volunteer.signup_id} className="hover:bg-slate-700/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {volunteer.first_name} {volunteer.last_name}
                                </div>
                                <div className="text-sm text-slate-400">
                                  ID: {volunteer.user_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{volunteer.email}</div>
                            <div className="text-sm text-slate-400">{volunteer.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{volunteer.emergency_contact || 'Not provided'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">
                              {dayjs(volunteer.signed_up_at).format('MMM D, YYYY')}
                            </div>
                            <div className="text-sm text-slate-400">
                              {dayjs(volunteer.signed_up_at).format('h:mm A')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              volunteer.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {volunteer.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;