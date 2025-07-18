'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, ExternalLink, Edit3, Eye, EyeOff, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';

interface Form {
  id: number;
  title: string;
  description: string;
  slug: string;
  google_form_url: string;
  deadline: string | null;
  display_on_homepage: boolean;
  status: string;
  icon: string;
  color: string;
  created_by_name: string;
  created_at: string;
}

export default function AdminFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, formId: number, formTitle: string}>({isOpen: false, formId: 0, formTitle: ''});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Check admin auth
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin/signin');
      return;
    }

    fetchForms();
  }, [router]);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/admin/forms');
      const data = await response.json();
      
      if (response.ok) {
        setForms(data.forms);
      } else {
        setError(data.error || 'Failed to fetch forms');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleHomepageDisplay = async (formId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_on_homepage: !currentStatus
        }),
      });

      if (response.ok) {
        fetchForms(); // Refresh the list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update form');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleDeleteForm = (formId: number, formTitle: string) => {
    setDeleteModal({isOpen: true, formId, formTitle});
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/forms/${deleteModal.formId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchForms(); // Refresh the list
        setDeleteModal({isOpen: false, formId: 0, formTitle: ''});
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete form');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading forms...</p>
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
              <h1 className="text-2xl font-bold text-white">Forms Management</h1>
              <p className="text-slate-400">Create and manage custom forms for your community</p>
            </div>
            
            <Link
              href="/admin/forms/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Form
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {forms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">No forms created yet</h3>
            <p className="text-slate-400 mb-6">Create your first form to collect applications and feedback from your community.</p>
            <Link
              href="/admin/forms/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Form
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Form
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Homepage Display
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {forms.map((form) => {
                    const isExpired = form.deadline && new Date(form.deadline) < new Date();
                    
                    return (
                      <tr key={form.id} className="hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${form.color} rounded-lg flex items-center justify-center`}>
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{form.title}</div>
                              <div className="text-sm text-slate-400">/forms/{form.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isExpired 
                              ? 'bg-red-100 text-red-800'
                              : form.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isExpired ? 'Expired' : form.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {form.deadline ? (
                            <div className="text-sm text-white">
                              {dayjs(form.deadline).format('MMM D, YYYY')}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">No deadline</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleHomepageDisplay(form.id, form.display_on_homepage)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              form.display_on_homepage
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {form.display_on_homepage ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {form.display_on_homepage ? 'Shown' : 'Hidden'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/forms/${form.slug}`}
                              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                              title="View form"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/forms/${form.id}/edit`}
                              className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                              title="Edit form"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <a
                              href={form.google_form_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-purple-400 transition-colors"
                              title="Open Google Form"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteForm(form.id, form.title)}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                              title="Delete form"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {forms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-2xl font-bold text-white">{forms.length}</div>
              <div className="text-sm text-slate-400">Total Forms</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-2xl font-bold text-green-400">
                {forms.filter(f => f.status === 'active').length}
              </div>
              <div className="text-sm text-slate-400">Active Forms</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-2xl font-bold text-blue-400">
                {forms.filter(f => f.display_on_homepage).length}
              </div>
              <div className="text-sm text-slate-400">On Homepage</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-2xl font-bold text-red-400">
                {forms.filter(f => f.deadline && new Date(f.deadline) < new Date()).length}
              </div>
              <div className="text-sm text-slate-400">Expired</div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Form</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{deleteModal.formTitle}</strong>? This will permanently remove the form and all associated data.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({isOpen: false, formId: 0, formTitle: ''})}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Form'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}