'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

interface Announcement {
  id: number;
  text: string;
  icon: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

const AnnouncementsPage = () => {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    icon: '',
    priority: 0
  });

  useEffect(() => {
    // Check admin auth
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin/signin');
      return;
    }
    
    fetchAnnouncements();
  }, [router]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements');
      const data = await response.json();
      
      if (response.ok) {
        setAnnouncements(data.announcements);
      } else {
        setError(data.error || 'Failed to fetch announcements');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      setError('Announcement text is required');
      return;
    }

    try {
      const url = editingId 
        ? `/api/admin/announcements/${editingId}`
        : '/api/admin/announcements';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          is_active: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ text: '', icon: '', priority: 0 });
        setShowCreateForm(false);
        setEditingId(null);
        setError('');
        fetchAnnouncements();
      } else {
        setError(data.error || 'Failed to save announcement');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      text: announcement.text,
      icon: announcement.icon,
      priority: announcement.priority
    });
    setEditingId(announcement.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAnnouncements();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete announcement');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const announcement = announcements.find(a => a.id === id);
      if (!announcement) return;

      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: announcement.text,
          icon: announcement.icon,
          priority: announcement.priority,
          is_active: !currentStatus
        }),
      });

      if (response.ok) {
        fetchAnnouncements();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update announcement status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const adjustPriority = async (id: number, newPriority: number) => {
    try {
      const announcement = announcements.find(a => a.id === id);
      if (!announcement) return;

      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: announcement.text,
          icon: announcement.icon,
          priority: Math.max(0, newPriority),
          is_active: announcement.is_active
        }),
      });

      if (response.ok) {
        fetchAnnouncements();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update announcement priority');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const cancelEdit = () => {
    setFormData({ text: '', icon: '', priority: 0 });
    setShowCreateForm(false);
    setEditingId(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading announcements...</p>
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
              <h1 className="text-2xl font-bold text-white">Announcements Management</h1>
              <p className="text-slate-400">Manage homepage announcement ticker</p>
            </div>
            
            <div className="flex gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Announcement
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Announcement Text *
                </label>
                <input
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter announcement text..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="📿"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Priority (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingId ? 'Update' : 'Create'} Announcement
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">
              All Announcements ({announcements.length})
            </h2>
          </div>
          
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-300 mb-2">No announcements yet</h3>
              <p className="text-slate-400">Create your first announcement to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-6 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{announcement.icon}</span>
                        <span className="text-white font-medium">{announcement.text}</span>
                        {announcement.is_active ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        Priority: {announcement.priority} | Created: {new Date(announcement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {/* Priority Controls */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => adjustPriority(announcement.id, announcement.priority + 1)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Increase priority"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => adjustPriority(announcement.id, announcement.priority - 1)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Decrease priority"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Toggle Active */}
                      <button
                        onClick={() => toggleActive(announcement.id, announcement.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          announcement.is_active 
                            ? 'text-green-400 hover:bg-green-400/10' 
                            : 'text-slate-400 hover:bg-slate-600'
                        }`}
                        title={announcement.is_active ? 'Hide announcement' : 'Show announcement'}
                      >
                        {announcement.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      
                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        title="Edit announcement"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;