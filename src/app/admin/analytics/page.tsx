'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  BarChart3,
  Users,
  Calendar,
  UserCheck,
  TrendingUp,
  Activity,
  PieChart,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Target,
  Award,
  Clock
} from 'lucide-react';
import { format, subDays } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalVolunteers: number;
    totalEvents: number;
    totalRsvps: number;
    engagementRate: number;
  };
  growth: {
    users: Array<{ date: string; new_users: number; total_users: number }>;
    volunteers: Array<{ date: string; new_volunteers: number; total_volunteers: number }>;
  };
  volunteers: {
    byTag: Array<{ tag_name: string; tag_color: string; volunteer_count: number }>;
    topVolunteers: Array<{ 
      name: string; 
      events_participated: number; 
      avg_rating: number; 
      tags: string[] 
    }>;
  };
  events: {
    byMonth: Array<{ month: string; event_count: number }>;
    popular: Array<{ 
      title: string; 
      date: string; 
      rsvp_count: number; 
      capacity: number; 
      fill_percentage: number 
    }>;
    categories: Array<{ category: string; event_count: number }>;
  };
  engagement: {
    rsvpTrends: Array<{ date: string; rsvps: number; unique_users: number }>;
    volunteerSignupTrends: Array<{ date: string; signups: number; unique_volunteers: number }>;
    userActivity: Array<{ activity_type: string; count: number }>;
    metrics: {
      recent_rsvps: number;
      recent_volunteer_signups: number;
      active_users: number;
      new_users: number;
    };
  };
  timeRange: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  useEffect(() => {
    // Check admin auth
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin/signin');
      return;
    }

    fetchAnalytics();
  }, [router, timeRange, startDate, endDate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (useCustomRange && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      } else {
        params.append('timeRange', timeRange);
      }

      const response = await fetch(`/api/admin/analytics?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTagColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      pink: '#EC4899',
      red: '#EF4444',
      teal: '#14B8A6',
      yellow: '#F59E0B',
      indigo: '#6366F1',
      gray: '#6B7280',
      cyan: '#06B6D4'
    };
    return colorMap[color] || '#6B7280';
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0', // slate-200
          font: {
            size: 12
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8' // slate-400
        },
        grid: {
          color: '#334155' // slate-700
        }
      },
      x: {
        ticks: {
          color: '#94a3b8' // slate-400
        },
        grid: {
          color: '#334155' // slate-700
        }
      }
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#e2e8f0', // slate-200
          font: {
            size: 14
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        backgroundColor: 'rgba(30, 41, 59, 0.9)', // slate-800 with opacity
        borderColor: '#475569', // slate-600
        borderWidth: 1
      }
    },
    maintainAspectRatio: false
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e2e8f0', // slate-200
          font: {
            size: 12
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        backgroundColor: 'rgba(30, 41, 59, 0.9)', // slate-800 with opacity
        borderColor: '#475569', // slate-600
        borderWidth: 1
      }
    },
    maintainAspectRatio: false,
    cutout: '50%'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">Failed to load analytics data</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
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
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-slate-400">Community insights and performance metrics</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View Selector */}
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-slate-400" />
              <select
                value={activeView}
                onChange={(e) => setActiveView(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="users">User Analytics</option>
                <option value="volunteers">Volunteer Analytics</option>
                <option value="events">Event Analytics</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="customRange"
                  checked={useCustomRange}
                  onChange={(e) => setUseCustomRange(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600"
                />
                <label htmlFor="customRange" className="text-slate-300 text-sm">
                  Custom Range
                </label>
              </div>

              {useCustomRange ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                  <option value="180">Last 6 months</option>
                  <option value="365">Last year</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Overview Dashboard */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Volunteers</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.totalVolunteers}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Events</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.totalEvents}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total RSVPs</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.totalRsvps}</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Engagement Rate</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.engagementRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-teal-500" />
                </div>
              </div>
            </div>

            {/* Growth Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
                <Line
                  data={{
                    labels: analytics.growth.users.map(item => format(new Date(item.date), 'MMM dd')),
                    datasets: [
                      {
                        label: 'Total Users',
                        data: analytics.growth.users.map(item => item.total_users),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Volunteer Growth</h3>
                <Line
                  data={{
                    labels: analytics.growth.volunteers.map(item => format(new Date(item.date), 'MMM dd')),
                    datasets: [
                      {
                        label: 'Total Volunteers',
                        data: analytics.growth.volunteers.map(item => item.total_volunteers),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity (Last 30 Days)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics.engagement.userActivity.map((activity, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{activity.count}</div>
                    <div className="text-slate-400 text-sm">{activity.activity_type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Analytics */}
        {activeView === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Daily User Registrations</h3>
                <Line
                  data={{
                    labels: analytics.growth.users.map(item => format(new Date(item.date), 'MMM dd')),
                    datasets: [
                      {
                        label: 'New Users',
                        data: analytics.growth.users.map(item => item.new_users),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Cumulative User Growth</h3>
                <Line
                  data={{
                    labels: analytics.growth.users.map(item => format(new Date(item.date), 'MMM dd')),
                    datasets: [
                      {
                        label: 'Total Users',
                        data: analytics.growth.users.map(item => item.total_users),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        )}

        {/* Volunteer Analytics */}
        {activeView === 'volunteers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Volunteers by Skills & Interests</h3>
                <div style={{ height: '400px' }}>
                  <Doughnut
                    data={{
                      labels: analytics.volunteers.byTag.map(tag => tag.tag_name),
                      datasets: [
                        {
                          data: analytics.volunteers.byTag.map(tag => tag.volunteer_count),
                          backgroundColor: analytics.volunteers.byTag.map(tag => getTagColor(tag.tag_color)),
                          borderWidth: 2,
                          borderColor: '#1e293b',
                        },
                      ],
                    }}
                    options={doughnutChartOptions}
                  />
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Top Active Volunteers</h3>
                <div className="space-y-3">
                  {analytics.volunteers.topVolunteers.slice(0, 5).map((volunteer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{volunteer.name}</div>
                        <div className="text-sm text-slate-400">
                          {volunteer.events_participated} events • {volunteer.avg_rating.toFixed(1)}★
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {volunteer.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Analytics */}
        {activeView === 'events' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Events by Month</h3>
                <Line
                  data={{
                    labels: analytics.events.byMonth.map(item => item.month),
                    datasets: [
                      {
                        label: 'Events',
                        data: analytics.events.byMonth.map(item => item.event_count),
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        fill: true,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Event Categories</h3>
                <div style={{ height: '400px' }}>
                  <Pie
                    data={{
                      labels: analytics.events.categories.map(cat => cat.category),
                      datasets: [
                        {
                          data: analytics.events.categories.map(cat => cat.event_count),
                          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'],
                          borderWidth: 2,
                          borderColor: '#1e293b',
                        },
                      ],
                    }}
                    options={pieChartOptions}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Most Popular Events</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                      <th className="pb-3">Event</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">RSVPs</th>
                      <th className="pb-3">Capacity</th>
                      <th className="pb-3">Fill Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {analytics.events.popular.slice(0, 8).map((event, index) => (
                      <tr key={index}>
                        <td className="py-3 text-white">{event.title}</td>
                        <td className="py-3 text-slate-300">{format(new Date(event.date), 'MMM dd, yyyy')}</td>
                        <td className="py-3 text-slate-300">{event.rsvp_count}</td>
                        <td className="py-3 text-slate-300">{event.capacity || 'Unlimited'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            event.fill_percentage > 80 ? 'bg-green-100 text-green-800' :
                            event.fill_percentage > 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.fill_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Analytics */}
        {activeView === 'engagement' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">RSVP Trends</h3>
                <Line
                  data={{
                    labels: analytics.engagement.rsvpTrends.map(item => format(new Date(item.date), 'MMM dd')),
                    datasets: [
                      {
                        label: 'RSVPs',
                        data: analytics.engagement.rsvpTrends.map(item => item.rsvps),
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Volunteer Signup Trends</h3>
                <Line
                  data={{
                    labels: analytics.engagement.volunteerSignupTrends.map(item => format(new Date(item.date), 'MMM dd')),
                    datasets: [
                      {
                        label: 'Volunteer Signups',
                        data: analytics.engagement.volunteerSignupTrends.map(item => item.signups),
                        borderColor: '#14B8A6',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        fill: true,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}