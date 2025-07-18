'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Clock, 
  Calendar, 
  Star, 
  Tag,
  User,
  AlertTriangle,
  Award,
  MapPin,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface Volunteer {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  skills: string[];
  availability: string[];
  preferences: any;
  status: string;
  volunteer_since: string;
  total_hours: number;
  admin_notes: string;
  tags: any[];
  eventHistory: any[];
}

export default function VolunteerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const volunteerId = params.id as string;
  
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check admin auth
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin/signin');
      return;
    }
    
    fetchVolunteer();
  }, [router, volunteerId]);

  const fetchVolunteer = async () => {
    try {
      const response = await fetch(`/api/admin/volunteers/${volunteerId}`);
      const data = await response.json();
      
      if (response.ok) {
        setVolunteer(data.volunteer);
      } else {
        setError(data.error || 'Failed to fetch volunteer');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      pink: 'bg-pink-100 text-pink-800',
      red: 'bg-red-100 text-red-800',
      teal: 'bg-teal-100 text-teal-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      gray: 'bg-gray-100 text-gray-800',
      cyan: 'bg-cyan-100 text-cyan-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'attended': return 'bg-green-100 text-green-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading volunteer details...</p>
        </div>
      </div>
    );
  }

  if (error || !volunteer) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Volunteer not found'}</p>
          <Link
            href="/admin/volunteers"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Volunteers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/volunteers"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {volunteer.first_name} {volunteer.last_name}
                </h1>
                <p className="text-slate-400">Volunteer Profile</p>
              </div>
            </div>
            
            <Link
              href={`/admin/volunteers/${volunteerId}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Basic Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(volunteer.status)}`}>
                    {volunteer.status}
                  </span>
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <div className="flex items-center gap-2 text-white">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${volunteer.email}`} className="hover:text-blue-400">
                      {volunteer.email}
                    </a>
                  </div>
                </div>
                
                {volunteer.phone && (
                  <div>
                    <p className="text-slate-400 text-sm">Phone</p>
                    <div className="flex items-center gap-2 text-white">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${volunteer.phone}`} className="hover:text-blue-400">
                        {volunteer.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-slate-400 text-sm">Volunteer Since</p>
                  <p className="text-white">
                    {new Date(volunteer.volunteer_since).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm">Total Hours</p>
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4" />
                    {volunteer.total_hours} hours
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {(volunteer.emergency_contact_name || volunteer.emergency_contact_phone) && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <h2 className="text-lg font-semibold text-white">Emergency Contact</h2>
                </div>
                
                <div className="space-y-2">
                  {volunteer.emergency_contact_name && (
                    <p className="text-white">{volunteer.emergency_contact_name}</p>
                  )}
                  {volunteer.emergency_contact_phone && (
                    <p className="text-slate-300">{volunteer.emergency_contact_phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {volunteer.tags.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Tag className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Tags</h2>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {volunteer.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag.color)}`}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {volunteer.admin_notes && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Admin Notes</h2>
                </div>
                
                <p className="text-slate-300 whitespace-pre-wrap">{volunteer.admin_notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Skills, Availability & Event History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Skills */}
            {volunteer.skills.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold text-white">Skills & Abilities</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {volunteer.skills.map((skill, index) => (
                    <div key={index} className="bg-slate-700 px-3 py-2 rounded-lg">
                      <p className="text-slate-300">{skill}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {volunteer.availability.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Availability</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {volunteer.availability.map((avail, index) => (
                    <div key={index} className="bg-slate-700 px-3 py-2 rounded-lg">
                      <p className="text-slate-300">{avail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event History */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Event History</h2>
                <span className="bg-slate-700 px-2 py-1 rounded-full text-xs text-slate-300">
                  {volunteer.eventHistory.length} events
                </span>
              </div>
              
              {volunteer.eventHistory.length > 0 ? (
                <div className="space-y-4">
                  {volunteer.eventHistory.map((event, index) => (
                    <div key={index} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAttendanceColor(event.attendance_status || 'pending')}`}>
                            {event.attendance_status || 'pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {event.hours_worked && (
                          <div>
                            <p className="text-slate-400">Hours Worked</p>
                            <p className="text-white">{event.hours_worked}h</p>
                          </div>
                        )}
                        
                        {event.performance_rating && (
                          <div>
                            <p className="text-slate-400">Rating</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-white">{event.performance_rating}/5</span>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-slate-400">Signup Status</p>
                          <p className="text-white capitalize">{event.signup_status}</p>
                        </div>
                        
                        <div>
                          <p className="text-slate-400">Signed Up</p>
                          <p className="text-white">{new Date(event.signup_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {(event.admin_feedback || event.volunteer_feedback) && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          {event.admin_feedback && (
                            <div className="mb-2">
                              <p className="text-slate-400 text-xs">Admin Feedback:</p>
                              <p className="text-slate-300 text-sm">{event.admin_feedback}</p>
                            </div>
                          )}
                          {event.volunteer_feedback && (
                            <div>
                              <p className="text-slate-400 text-xs">Volunteer Feedback:</p>
                              <p className="text-slate-300 text-sm">{event.volunteer_feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No event history yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}