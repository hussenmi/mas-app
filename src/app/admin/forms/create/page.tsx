'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, ExternalLink, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CreateFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    googleFormUrl: '',
    embedUrl: '',
    deadline: '',
    displayOnHomepage: false,
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
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const adminData = localStorage.getItem('admin');
      const admin = adminData ? JSON.parse(adminData) : null;

      // Clean up instructions and requirements (remove empty ones)
      const cleanInstructions = formData.instructions.filter(inst => inst.trim() !== '');
      const cleanRequirements = formData.requirements.filter(req => req.trim() !== '');

      const response = await fetch('/api/admin/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          instructions: cleanInstructions.length > 0 ? cleanInstructions : null,
          requirements: cleanRequirements.length > 0 ? cleanRequirements : null,
          createdBy: admin?.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Form created successfully!');
        setTimeout(() => {
          router.push('/admin/forms');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create form');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const handleGoogleFormUrlChange = (url: string) => {
    // Auto-generate embed URL from Google Form URL
    let embedUrl = '';
    if (url && url.includes('docs.google.com/forms')) {
      // Convert /viewform to /viewform?embedded=true
      if (url.includes('/viewform')) {
        embedUrl = url.includes('?') 
          ? url + '&embedded=true'
          : url + '?embedded=true';
      } else {
        // If URL doesn't end with /viewform, add it
        const baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
        embedUrl = baseUrl + '/viewform?embedded=true';
      }
    }
    
    setFormData({
      ...formData,
      googleFormUrl: url,
      embedUrl: embedUrl
    });
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

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Create New Form</h1>
              <p className="text-slate-400">Set up a new Google Form integration for your community</p>
            </div>
            
            <Link
              href="/admin/forms"
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Forms
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Form Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Night Market Vendor Application"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="night-market-vendor-application"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Will be accessible at: /forms/{formData.slug}</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this form is for and who should fill it out..."
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Google Form Integration</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">How to get these URLs:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Create your form at <a href="https://forms.google.com" target="_blank" className="underline">forms.google.com</a></li>
                    <li>Click "Send" button → Copy the link for "Google Form URL"</li>
                    <li>Click "Send" → "Embed" tab → Copy the URL from the iframe for "Embed URL"</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Google Form URL *
                </label>
                <input
                  type="url"
                  value={formData.googleFormUrl}
                  onChange={(e) => handleGoogleFormUrlChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://docs.google.com/forms/d/11U-1K8aVV38cvTPkmNB2o1sUbHGLVkY5vt58zzf16PA"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Paste your Google Form URL - we'll auto-generate the embed URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Embed URL (Auto-generated) *
                </label>
                <input
                  type="url"
                  value={formData.embedUrl}
                  onChange={(e) => setFormData({...formData, embedUrl: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Auto-generated from Google Form URL above..."
                  required
                  readOnly
                />
                <p className="text-xs text-slate-400 mt-1">✨ Automatically generated when you enter the Google Form URL above</p>
              </div>

              {formData.googleFormUrl && (
                <a
                  href={formData.googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Test Google Form Link
                </a>
              )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Display Options</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="displayOnHomepage"
                  checked={formData.displayOnHomepage}
                  onChange={(e) => setFormData({...formData, displayOnHomepage: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="displayOnHomepage" className="text-sm text-slate-300">
                  Display prominently on homepage (Featured form)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Color Theme
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="from-blue-500 to-blue-600">Blue</option>
                    <option value="from-green-500 to-green-600">Green</option>
                    <option value="from-purple-500 to-purple-600">Purple</option>
                    <option value="from-orange-500 to-orange-600">Orange</option>
                    <option value="from-red-500 to-red-600">Red</option>
                    <option value="from-teal-500 to-teal-600">Teal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/admin/forms"
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}