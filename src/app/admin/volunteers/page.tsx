'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Star,
  Tag,
  Calendar,
  Mail,
  Phone,
  Clock,
  Award,
  UserPlus
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
  total_events: number;
  tags: string[];
  tag_colors: string[];
  avg_rating: number;
  admin_notes: string;
}

interface VolunteerTag {
  id: number;
  name: string;
  color: string;
  description: string;
  volunteer_count: number;
}

export default function VolunteersPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tags, setTags] = useState<VolunteerTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const [newTagDescription, setNewTagDescription] = useState('');

  useEffect(() => {
    // Check admin auth
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin/signin');
      return;
    }
    
    fetchVolunteers();
    fetchTags();
  }, [router, statusFilter, selectedTags, searchTerm]);

  const fetchVolunteers = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/volunteers?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setVolunteers(data.volunteers);
      }
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/volunteers/tags');
      const data = await response.json();
      
      if (response.ok) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const response = await fetch('/api/admin/volunteers/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName,
          color: newTagColor,
          description: newTagDescription
        }),
      });
      
      if (response.ok) {
        setNewTagName('');
        setNewTagDescription('');
        setNewTagColor('blue');
        fetchTags();
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const toggleTagFilter = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading volunteers...</p>
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
              <h1 className="text-2xl font-bold text-white">Volunteer Management</h1>
              <p className="text-slate-400">Manage volunteer profiles, skills, and engagement</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTagManager(!showTagManager)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Tag className="w-4 h-4" />
                Manage Tags
              </button>
              
              <Link
                href="/admin/volunteers/create"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Volunteer
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tag Manager Modal */}
        {showTagManager && (
          <div className="mb-6 bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Manage Volunteer Tags</h3>
            
            {/* Create New Tag */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <input
                type="text"
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <select
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                {['blue', 'green', 'purple', 'orange', 'pink', 'red', 'teal', 'yellow', 'indigo', 'gray', 'cyan'].map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Description (optional)"
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <button
                onClick={createTag}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Tag
              </button>
            </div>
            
            {/* Existing Tags */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {tags.map(tag => (
                <div key={tag.id} className={`px-3 py-2 rounded-lg text-sm ${getTagColor(tag.color)}`}>
                  <div className="font-medium">{tag.name}</div>
                  <div className="text-xs opacity-75">{tag.volunteer_count} volunteers</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search volunteers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            {/* Clear Filters */}
            <div className="flex items-center justify-end">
              {(selectedTags.length > 0 || statusFilter || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedTags([]);
                    setStatusFilter('');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Filter by Skills & Interests
            </h3>
            {selectedTags.length > 0 && (
              <span className="text-sm text-slate-400">
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTagFilter(tag.name)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all hover:scale-105 border-2 ${
                  selectedTags.includes(tag.name)
                    ? `${getTagColor(tag.color)} border-opacity-50`
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{tag.name}</div>
                  <div className="text-xs opacity-75 mt-1">{tag.volunteer_count} volunteers</div>
                </div>
              </button>
            ))}
          </div>
          
          {selectedTags.length === 0 && (
            <p className="text-slate-400 text-sm mt-4 text-center">
              Click on tags above to filter volunteers by their skills and interests
            </p>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Volunteers</p>
                <p className="text-2xl font-bold text-white">{volunteers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Volunteers</p>
                <p className="text-2xl font-bold text-white">
                  {volunteers.filter(v => v.status === 'active').length}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Available Tags</p>
                <p className="text-2xl font-bold text-white">{tags.length}</p>
              </div>
              <Tag className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Volunteers Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {volunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-slate-700/50 cursor-pointer" onClick={() => window.location.href = `/admin/volunteers/${volunteer.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
                          {volunteer.first_name} {volunteer.last_name}
                        </div>
                        <div className="text-sm text-slate-400">
                          Member since {new Date(volunteer.volunteer_since).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {volunteer.email}
                        </div>
                        {volunteer.phone && (
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3" />
                            {volunteer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(volunteer.status)}`}>
                        {volunteer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {volunteer.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={tag}
                            className={`px-2 py-1 text-xs rounded-full ${getTagColor(volunteer.tag_colors[index] || 'gray')}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {volunteer.tags.length > 2 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-slate-600 text-slate-300">
                            +{volunteer.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {volunteer.total_events} events
                        </div>
                        {volunteer.avg_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {volunteer.avg_rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {volunteers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No volunteers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}