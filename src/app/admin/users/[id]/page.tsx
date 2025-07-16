'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  User, 
  Mail, 
  Phone,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  UserCheck,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  emergency_contact: string;
  created_at: string;
}

interface VolunteerActivity {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  signed_up_at: string;
}

interface RSVPActivity {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  payment_status: string;
  amount_paid: number;
  rsvped_at: string;
}

const UserDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [volunteerActivities, setVolunteerActivities] = useState<VolunteerActivity[]>([]);
  const [rsvpActivities, setRsvpActivities] = useState<RSVPActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'volunteers' | 'rsvps'>('volunteers');

  useEffect(() => {
    // Check admin auth
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin/signin');
      return;
    }

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, router]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setVolunteerActivities(data.volunteerActivities);
        setRsvpActivities(data.rsvpActivities);
      } else {
        setError(data.error || 'Failed to fetch user details');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error || 'User not found'}</p>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
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
            <div>
              <h1 className="text-2xl font-bold text-white">{user.first_name} {user.last_name}</h1>
              <p className="text-slate-400">User Details & Activity</p>
            </div>
            
            <div className="flex gap-4">
              <Link
                href="/admin/users"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Users
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* User Details */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">User Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{user.first_name} {user.last_name}</h3>
                    <p className="text-slate-400">User ID: {user.id}</p>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Email</label>
                  <div className="flex items-center gap-2 text-white mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Phone</label>
                  <div className="flex items-center gap-2 text-white mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Emergency Contact</label>
                  <div className="flex items-center gap-2 text-white mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{user.emergency_contact || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Member Since</label>
                  <div className="flex items-center gap-2 text-white mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{dayjs(user.created_at).format('MMMM D, YYYY')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mt-6">
              <h2 className="text-lg font-semibold text-white mb-4">Activity Summary</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{volunteerActivities.length}</div>
                  <div className="text-sm text-slate-400">Volunteer Events</div>
                </div>
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{rsvpActivities.length}</div>
                  <div className="text-sm text-slate-400">Event RSVPs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section with Tabs */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-xl border border-slate-700">
              {/* Tab Navigation */}
              <div className="border-b border-slate-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('volunteers')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'volunteers'
                        ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Volunteer History</span>
                      <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded-full">
                        {volunteerActivities.length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('rsvps')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'rsvps'
                        ? 'text-green-400 border-b-2 border-green-400 bg-slate-700/50'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Event RSVPs</span>
                      <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded-full">
                        {rsvpActivities.length}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px]">
                {activeTab === 'volunteers' ? (
                  <>
                    {volunteerActivities.length === 0 ? (
                      <div className="text-center py-16">
                        <UserCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-300 mb-2">No volunteer activity</h3>
                        <p className="text-slate-400">This user hasn't signed up to volunteer for any events yet.</p>
                      </div>
                    ) : (
                      <div className="p-6 space-y-4">
                        {volunteerActivities.map((activity) => (
                          <div key={activity.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white mb-2">{activity.title}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{dayjs(activity.date).format('MMMM D, YYYY')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{dayjs(`${activity.date} ${activity.time}`).format('h:mm A')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{activity.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4" />
                                    <span>Signed up: {dayjs(activity.signed_up_at).format('MMM D, YYYY')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  activity.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {activity.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {rsvpActivities.length === 0 ? (
                      <div className="text-center py-16">
                        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-300 mb-2">No RSVP activity</h3>
                        <p className="text-slate-400">This user hasn't RSVPed to any events yet.</p>
                      </div>
                    ) : (
                      <div className="p-6 space-y-4">
                        {rsvpActivities.map((activity) => (
                          <div key={activity.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white mb-2">{activity.title}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300 mb-2">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{dayjs(activity.date).format('MMMM D, YYYY')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{dayjs(`${activity.date} ${activity.time}`).format('h:mm A')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{activity.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>RSVPed: {dayjs(activity.rsvped_at).format('MMM D, YYYY')}</span>
                                  </div>
                                </div>
                                {activity.amount_paid > 0 && (
                                  <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Paid: ${activity.amount_paid.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex flex-col items-end gap-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  activity.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {activity.status}
                                </span>
                                {activity.amount_paid > 0 && (
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    activity.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 
                                    activity.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {activity.payment_status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;