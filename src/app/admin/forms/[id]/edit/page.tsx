'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Form {
  id: number;
  title: string;
  description: string;
  slug: string;
  google_form_url: string;
  embed_url?: string;
  deadline: string | null;
  display_on_homepage: boolean;
  status: string;
  icon: string;
  color: string;
  instructions: string[] | null;
  requirements: string[] | null;
  created_by_name: string;
  created_at: string;
}

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    google_form_url: '',
    embed_url: '',
    deadline: '',
    display_on_homepage: false,
    status: 'active',
    icon: 'FileText',
    color: 'from-blue-500 to-blue-600',
    instructions: [''],
    requirements: ['']
  });

  useEffect(() => {
    // Check admin auth
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin/signin');
      return;
    }

    if (params.id) {
      fetchForm(params.id as string);
    }
  }, [router, params.id]);

  // Auto-generate embed URL when Google Form URL changes
  const handleGoogleFormUrlChange = (url: string) => {
    if (url.includes('docs.google.com/forms')) {
      // Convert regular form URL to embed URL
      let embedUrl = url;
      if (url.includes('/viewform')) {
        embedUrl = url.replace('/viewform', '/viewform?embedded=true');
      } else if (!url.includes('embedded=true')) {
        const separator = url.includes('?') ? '&' : '?';
        embedUrl = url + separator + 'embedded=true';
      }
      setFormData(prev => ({...prev, google_form_url: url, embed_url: embedUrl}));
    } else {
      setFormData(prev => ({...prev, google_form_url: url}));
    }
  };

  const fetchForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/admin/forms/${formId}`);
      const data = await response.json();
      
      if (response.ok) {
        const fetchedForm = data.form;
        setForm(fetchedForm);
        setFormData({
          title: fetchedForm.title || '',
          description: fetchedForm.description || '',
          slug: fetchedForm.slug || '',
          google_form_url: fetchedForm.google_form_url || '',
          embed_url: fetchedForm.embed_url || '',
          deadline: fetchedForm.deadline ? fetchedForm.deadline.split('T')[0] : '',
          display_on_homepage: fetchedForm.display_on_homepage || false,
          status: fetchedForm.status || 'active',
          icon: fetchedForm.icon || 'FileText',
          color: fetchedForm.color || 'from-blue-500 to-blue-600',
          instructions: fetchedForm.instructions || [''],
          requirements: fetchedForm.requirements || ['']
        });
      } else {
        setError(data.error || 'Failed to fetch form');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.title.trim() || !formData.google_form_url.trim()) {
      setError('Title and Google Form URL are required');
      setSaving(false);
      return;
    }

    try {
      const cleanInstructions = formData.instructions.filter(inst => inst.trim() !== '');
      const cleanRequirements = formData.requirements.filter(req => req.trim() !== '');

      const response = await fetch(`/api/admin/forms/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          instructions: cleanInstructions.length > 0 ? cleanInstructions : null,
          requirements: cleanRequirements.length > 0 ? cleanRequirements : null,
          deadline: formData.deadline || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Form updated successfully!');
        setTimeout(() => {
          router.push('/admin/forms');
        }, 2000);
      } else {
        setError(data.error || 'Failed to update form');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, '']
    });
  };

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index)
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({
      ...formData,
      instructions: newInstructions
    });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({
      ...formData,
      requirements: newRequirements
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">Form not found</h3>
          <Link href="/admin/forms" className="text-blue-400 hover:underline">
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/admin/forms"
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Form</h1>
            <p className="text-slate-400">Update form details and settings</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Form Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter form title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="form-url-slug"
                />
                <p className="text-xs text-slate-400 mt-1">Will be available at /forms/{formData.slug}</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this form"
              />
            </div>
          </div>

          {/* Form URLs */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Form URLs</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Google Form URL *
                </label>
                <input
                  type="url"
                  value={formData.google_form_url}
                  onChange={(e) => handleGoogleFormUrlChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://docs.google.com/forms/..."
                  required
                />
                {formData.google_form_url && (
                  <a
                    href={formData.google_form_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:underline text-sm mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Test form link
                  </a>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Embed URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.embed_url}
                  onChange={(e) => setFormData({...formData, embed_url: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://docs.google.com/forms/.../viewform?embedded=true"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.display_on_homepage}
                    onChange={(e) => setFormData({...formData, display_on_homepage: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-300">Display on homepage</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/forms"
              className="px-6 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating...' : 'Update Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}