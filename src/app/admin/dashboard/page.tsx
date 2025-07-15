'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Users, 
  Calendar, 
  DollarSign, 
  Bell, 
  Settings, 
  LogOut,
  BarChart3,
  Clock,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const AdminDashboardPage = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    } else {
      router.push('/admin/signin');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    window.dispatchEvent(new CustomEvent('adminLogout'));
    router.push('/admin/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const dashboardItems = [
    {
      title: 'Event Management',
      description: 'Create, edit, and manage volunteer events',
      icon: Calendar,
      href: '/admin/events',
      color: 'from-blue-600 to-blue-700',
      stats: '12 Active Events'
    },
    {
      title: 'User Management',
      description: 'View and manage registered users',
      icon: Users,
      href: '/admin/users',
      color: 'from-green-600 to-green-700',
      stats: '248 Users'
    },
    {
      title: 'Donations',
      description: 'Track donations and generate reports',
      icon: DollarSign,
      href: '/admin/donations',
      color: 'from-yellow-600 to-yellow-700',
      stats: '$12,450 This Month'
    },
    {
      title: 'Announcements',
      description: 'Manage homepage announcements',
      icon: Bell,
      href: '/admin/announcements',
      color: 'from-purple-600 to-purple-700',
      stats: '3 Active'
    },
    {
      title: 'Analytics',
      description: 'View site analytics and reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'from-indigo-600 to-indigo-700',
      stats: '1.2k Monthly Visits'
    },
    {
      title: 'Settings',
      description: 'System configuration and settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-gray-600 to-gray-700',
      stats: 'Configure'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Admin Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MAS Queens Admin</h1>
                <p className="text-slate-400 text-sm">Management Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-semibold">{admin.firstName} {admin.lastName}</p>
                <p className="text-slate-400 text-sm capitalize">{admin.role}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {admin.firstName}!
          </h2>
          <p className="text-slate-400">
            Here's what's happening with MAS Queens today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">248</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Events</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Monthly Donations</p>
                <p className="text-2xl font-bold text-white">$12.4k</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Prayer Time</p>
                <p className="text-2xl font-bold text-white">Dhuhr</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3">
                      {item.description}
                    </p>
                    <p className="text-slate-300 text-sm font-medium">
                      {item.stats}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/events/create"
              className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Create Event</span>
            </Link>
            
            <Link
              href="/admin/announcements/create"
              className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Add Announcement</span>
            </Link>
            
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5 text-white" />
              <span className="text-white font-medium">View Site</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;