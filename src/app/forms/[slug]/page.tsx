'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Form data will be fetched from API

export default function FormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [formNotFound, setFormNotFound] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetchForm();
  }, [slug]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${slug}`);
      const data = await response.json();
      
      if (response.ok) {
        setForm(data.form);
      } else {
        setFormNotFound(true);
      }
    } catch (error) {
      console.error('Failed to fetch form:', error);
      setFormNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (formNotFound || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Form Not Found</h1>
          <p className="text-gray-600 mb-6">The form you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/forms"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  const isDeadlinePassed = form?.isExpired || (form?.deadline && new Date(form.deadline) < new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <Link 
              href="/forms"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Forms
            </Link>
            <a 
              href={form.google_form_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </a>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-green-100">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">{form.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">{form.description}</p>
            
            {form.deadline && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                isDeadlinePassed 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                <AlertCircle className="w-4 h-4" />
                Deadline: {new Date(form.deadline).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {isDeadlinePassed && ' (EXPIRED)'}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Form Embed */}
          <div className="lg:col-span-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 overflow-hidden">
              {isDeadlinePassed ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-600 mb-2">Form Submission Closed</h3>
                  <p className="text-gray-600">The deadline for this form has passed. Please contact us if you have questions.</p>
                </div>
              ) : (
                <iframe 
                  src={form.embed_url}
                  width="100%" 
                  height="800"
                  frameBorder="0"
                  className="w-full"
                  title={form.title}
                >
                  Loading form...
                </iframe>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Instructions */}
            {form.instructions && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📝 Instructions</h3>
                <ul className="space-y-2">
                  {form.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {form.requirements && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-800 mb-4">📋 Requirements</h3>
                <ul className="space-y-2">
                  {form.requirements.map((requirement, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-800 mb-4">💬 Need Help?</h3>
              <div className="space-y-3 text-sm text-green-700">
                <p>
                  📧 Email us at{' '}
                  <a href="mailto:info@masqueens.org" className="font-semibold hover:underline">
                    info@masqueens.org
                  </a>
                </p>
                <p>
                  📞 Call us at{' '}
                  <a href="tel:+17186066025" className="font-semibold hover:underline">
                    (718) 606-6025
                  </a>
                </p>
                <p className="text-xs text-green-600 mt-3">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}