'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, Heart, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface VolunteerTag {
  id: number;
  name: string;
  color: string;
  description: string;
}

export default function VolunteerApplicationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tags, setTags] = useState<VolunteerTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    areasOfInterest: [] as number[],
    skills: [''],
    availability: [''],
    emergencyContactName: '',
    emergencyContactPhone: '',
    whyVolunteer: '',
    previousExperience: '',
    additionalInfo: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/signin');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // First fetch tags, then check existing profile
    fetchTags().then((fetchedTags) => {
      checkExistingProfile(parsedUser.id, fetchedTags);
    });
  }, [router]);

  const checkExistingProfile = async (userId: number, fetchedTags: VolunteerTag[] = []) => {
    try {
      const response = await fetch(`/api/user/volunteer-profile?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          // User has existing profile, populate form for editing
          setExistingProfile(data.profile);
          setIsEditing(true);
          
          // Pre-populate form with existing data
          setFormData({
            phone: data.profile.phone || '',
            areasOfInterest: data.profile.tags ? data.profile.tags.map((tag: string) => {
              const tagObj = fetchedTags.find(t => t.name === tag);
              return tagObj ? tagObj.id : null;
            }).filter(Boolean) : [],
            skills: data.profile.skills || [''],
            availability: data.profile.availability || [''],
            emergencyContactName: data.profile.emergency_contact_name || '',
            emergencyContactPhone: data.profile.emergency_contact_phone || '',
            whyVolunteer: data.profile.why_volunteer || '',
            previousExperience: data.profile.previous_experience || '',
            additionalInfo: data.profile.additional_info || ''
          });
          return;
        }
      }
    } catch (error) {
      console.error('Failed to check existing profile:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/volunteers/tags');
      const data = await response.json();
      if (response.ok) {
        setTags(data.tags);
        return data.tags;
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.areasOfInterest.length === 0) {
      setError('Please select at least one area of interest');
      setLoading(false);
      return;
    }
    if (!formData.emergencyContactName.trim()) {
      setError('Emergency contact name is required');
      setLoading(false);
      return;
    }
    if (!formData.emergencyContactPhone.trim()) {
      setError('Emergency contact phone is required');
      setLoading(false);
      return;
    }

    try {
      const cleanSkills = formData.skills.filter(skill => skill.trim() !== '');
      const cleanAvailability = formData.availability.filter(avail => avail.trim() !== '');

      const response = await fetch('/api/volunteer/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          phone: formData.phone,
          areasOfInterest: formData.areasOfInterest,
          skills: cleanSkills,
          availability: cleanAvailability,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          whyVolunteer: formData.whyVolunteer,
          previousExperience: formData.previousExperience,
          additionalInfo: formData.additionalInfo
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Success!');
        setTimeout(() => {
          router.push('/volunteer');
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit volunteer application');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, '']
    });
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData({
      ...formData,
      skills: newSkills
    });
  };

  const addAvailability = () => {
    setFormData({
      ...formData,
      availability: [...formData.availability, '']
    });
  };

  const removeAvailability = (index: number) => {
    setFormData({
      ...formData,
      availability: formData.availability.filter((_, i) => i !== index)
    });
  };

  const updateAvailability = (index: number, value: string) => {
    const newAvailability = [...formData.availability];
    newAvailability[index] = value;
    setFormData({
      ...formData,
      availability: newAvailability
    });
  };

  const toggleAreaOfInterest = (tagId: number) => {
    setFormData({
      ...formData,
      areasOfInterest: formData.areasOfInterest.includes(tagId)
        ? formData.areasOfInterest.filter(id => id !== tagId)
        : [...formData.areasOfInterest, tagId]
    });
  };

  const getTagColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      teal: 'bg-teal-100 text-teal-800 border-teal-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              {isEditing ? 'Update Volunteer Preferences' : 'Become a Volunteer'}
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isEditing 
              ? 'Update your volunteer information and preferences below.'
              : 'Join our community of dedicated volunteers and make a meaningful impact. Please fill out this application to get started.'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Personal Information */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              👤 Contact Information
            </h2>
            
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Logged in as:</strong> {user.first_name} {user.last_name} ({user.email})
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
              <p className="text-sm text-gray-500 mt-1">
                So we can contact you about volunteer opportunities
              </p>
            </div>
          </div>

          {/* Areas of Interest */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🎯 Areas of Interest *
            </h2>
            <p className="text-gray-600 mb-4">
              Select the areas where you'd like to volunteer. This helps us match you with suitable opportunities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleAreaOfInterest(tag.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all hover:scale-105 ${
                    formData.areasOfInterest.includes(tag.id)
                      ? getTagColor(tag.color)
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Skills & Experience */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🛠️ Skills & Experience
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Abilities
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  List your relevant skills that could help in volunteer activities
                </p>
                
                <div className="space-y-3">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Event planning, Cooking, Arabic translation, Photography"
                      />
                      {formData.skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addSkill}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Skill
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Volunteer Experience
                </label>
                <textarea
                  value={formData.previousExperience}
                  onChange={(e) => setFormData({...formData, previousExperience: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us about any previous volunteer work or community involvement..."
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📅 Availability (Optional)
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When are you generally available?
              </label>
              <p className="text-sm text-gray-500 mb-3">
                This helps us match you with suitable volunteer opportunities
              </p>
              
              <div className="space-y-3">
                {formData.availability.map((avail, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={avail}
                      onChange={(e) => updateAvailability(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Weekend mornings, Friday evenings, Monthly events"
                    />
                    {formData.availability.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAvailability(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addAvailability}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Availability
                </button>
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              💭 Tell Us About Yourself (Optional)
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why do you want to volunteer with us?
                </label>
                <textarea
                  value={formData.whyVolunteer}
                  onChange={(e) => setFormData({...formData, whyVolunteer: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Share your motivation and what you hope to contribute to our community..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Any other information you'd like us to know..."
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🚨 Emergency Contact
            </h2>
            <p className="text-gray-600 mb-4">
              For safety purposes, we need an emergency contact who can be reached if needed.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Full name of emergency contact"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Phone *
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center gap-4">
            <Link
              href="/volunteer"
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              <Heart className="w-5 h-5" />
              {loading 
                ? (isEditing ? 'Updating preferences...' : 'Joining our team...') 
                : (isEditing ? 'Update Preferences' : 'Join Our Volunteer Team')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}