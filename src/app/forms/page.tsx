'use client';

import React from 'react';
import { FileText, Users, Calendar, DollarSign, Info } from 'lucide-react';
import Link from 'next/link';

export default function FormsPage() {
  // Available forms - admin can easily add more by updating this array
  const availableForms = [
    {
      id: 'vendor-application',
      title: 'Night Market Vendor Application',
      description: 'Apply to become a vendor at our upcoming community night market. Open to food vendors, crafts, and local businesses.',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      status: 'active',
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/viewform', // Replace with actual form URL
      embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/viewform?embedded=true', // Replace with actual embed URL
      deadline: '2025-07-25',
      featured: true
    },
    {
      id: 'event-feedback',
      title: 'Event Feedback Form',
      description: 'Share your thoughts and suggestions about our recent community events to help us improve.',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      status: 'active',
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY/viewform', // Replace with actual form URL
      embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY/viewform?embedded=true', // Replace with actual embed URL
      deadline: null,
      featured: false
    }
  ];

  const activeForms = availableForms.filter(form => form.status === 'active');
  const featuredForms = activeForms.filter(form => form.featured);
  const regularForms = activeForms.filter(form => !form.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">Community Forms</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            Access application forms, registration forms, and feedback surveys for MAS Queens community programs
          </p>
        </div>

        {/* Featured Forms */}
        {featuredForms.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🌟 Featured Forms
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredForms.map((form) => {
                const IconComponent = form.icon;
                return (
                  <div key={form.id} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className={`bg-gradient-to-r ${form.color} p-6 text-white`}>
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{form.title}</h3>
                          {form.deadline && (
                            <p className="text-white/90 text-sm">
                              Deadline: {new Date(form.deadline).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-6 leading-relaxed">{form.description}</p>
                      <div className="flex gap-3">
                        <Link 
                          href={`/forms/${form.id}`}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 text-center"
                        >
                          Fill Out Form
                        </Link>
                        <a 
                          href={form.googleFormUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center"
                        >
                          Open in New Tab
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Forms */}
        {regularForms.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              All Forms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularForms.map((form) => {
                const IconComponent = form.icon;
                return (
                  <div key={form.id} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className={`bg-gradient-to-r ${form.color} p-4 text-white`}>
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-6 h-6" />
                        <h3 className="font-bold">{form.title}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{form.description}</p>
                      {form.deadline && (
                        <p className="text-red-600 text-xs mb-4 font-medium">
                          Deadline: {new Date(form.deadline).toLocaleDateString()}
                        </p>
                      )}
                      <div className="space-y-2">
                        <Link 
                          href={`/forms/${form.id}`}
                          className="block w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 text-center text-sm"
                        >
                          Fill Out Form
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Forms Available */}
        {activeForms.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Forms Available</h3>
            <p className="text-gray-500">Check back later for new forms and applications.</p>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-green-100 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Important Information</h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              📝 <strong>Form Submissions:</strong> All form responses are securely collected and reviewed by our administrative team.
            </p>
            <p>
              ⏰ <strong>Response Time:</strong> We typically respond to applications and submissions within 3-5 business days.
            </p>
            <p>
              📧 <strong>Questions?</strong> Contact us at <a href="mailto:info@masqueens.org" className="text-green-600 hover:underline">info@masqueens.org</a> if you need assistance with any forms.
            </p>
            <p>
              🔒 <strong>Privacy:</strong> Your information is kept confidential and used only for the purposes stated in each form.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}