'use client';

import React, { useState } from 'react';
import { Heart, Target, Users, Building, BookOpen, Utensils, DollarSign, CreditCard } from 'lucide-react';

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCause, setSelectedCause] = useState('general');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');

  // Get payment link from environment variables (your existing setup)
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "#";

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];
  
  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly', multiplier: 52 },
    { value: 'monthly', label: 'Monthly', multiplier: 12 },
    { value: 'quarterly', label: 'Quarterly', multiplier: 4 },
    { value: 'yearly', label: 'Yearly', multiplier: 1 }
  ];
  
  const causes = [
    {
      id: 'general',
      name: 'General Fund',
      description: 'Support overall masjid operations and community programs',
      icon: Building,
      color: 'green',
      raised: 15420,
      goal: 25000
    },
    {
      id: 'education',
      name: 'Islamic Education',
      description: 'Fund Quran classes, Islamic studies, and educational resources',
      icon: BookOpen,
      color: 'blue',
      raised: 8750,
      goal: 15000
    },
    {
      id: 'food',
      name: 'Food Programs',
      description: 'Community iftars, food bank, and feeding the needy',
      icon: Utensils,
      color: 'orange',
      raised: 6200,
      goal: 10000
    },
    {
      id: 'youth',
      name: 'Youth Programs',
      description: 'Sports, camps, mentorship, and youth activities',
      icon: Users,
      color: 'purple',
      raised: 4300,
      goal: 8000
    },
    {
      id: 'maintenance',
      name: 'Building Maintenance',
      description: 'Repairs, renovations, and facility improvements',
      icon: Building,
      color: 'gray',
      raised: 12100,
      goal: 20000
    }
  ];

  const selectedCauseData = causes.find(cause => cause.id === selectedCause);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(0);
  };

  const getCurrentAmount = () => {
    return customAmount ? parseFloat(customAmount) : selectedAmount;
  };

  const handleDonate = () => {
    // You can modify this to include the selected amount and cause in the payment link
    const amount = getCurrentAmount();
    const donationData = {
      amount,
      cause: selectedCause,
      recurring: isRecurring,
      frequency: isRecurring ? recurringFrequency : null
    };
    
    // Store donation data in localStorage for payment processing
    localStorage.setItem('donationData', JSON.stringify(donationData));
    
    // Redirect to Stripe payment
    window.open(paymentLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-full">
                <Heart className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Support Your <span className="text-green-700">Masjid</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed max-w-3xl mx-auto">
              Your generous sadaqah helps us maintain our sacred space, run vital programs, 
              and serve our vibrant community. Every contribution makes a difference.
            </p>
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 rounded-xl p-4 max-w-2xl mx-auto">
              <p className="text-yellow-800 font-semibold">
                🌟 &quot;The believer&apos;s shade on the Day of Resurrection will be his charity.&quot; - Prophet Muhammad (PBUH)
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 overflow-hidden">
              {/* Cause Selection */}
              <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-6">
                <h2 className="text-2xl font-bold mb-4">Choose Your Cause</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {causes.map((cause) => {
                    const IconComponent = cause.icon;
                    const isSelected = selectedCause === cause.id;
                    return (
                      <button
                        key={cause.id}
                        onClick={() => setSelectedCause(cause.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          isSelected 
                            ? 'border-white bg-white/20 transform scale-105' 
                            : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <IconComponent className="w-6 h-6" />
                          <span className="font-semibold">{cause.name}</span>
                        </div>
                        <p className="text-sm text-green-100">{cause.description}</p>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Raised: {formatCurrency(cause.raised)}</span>
                            <span>Goal: {formatCurrency(cause.goal)}</span>
                          </div>
                          <div className="w-full bg-white/30 rounded-full h-2">
                            <div 
                              className="bg-white h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(cause.raised / cause.goal) * 100}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Selection */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Select Amount</h3>
                
                {/* Predefined Amounts */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`p-4 rounded-xl border-2 font-semibold transition-all duration-300 ${
                        selectedAmount === amount
                          ? 'border-green-500 bg-green-50 text-green-800 transform scale-105'
                          : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or enter custom amount:
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Recurring Donation */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700 font-semibold">Make this a recurring donation</span>
                  </label>
                  
                  {isRecurring && (
                    <div className="mt-4 ml-8 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Choose frequency:
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {frequencyOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setRecurringFrequency(option.value)}
                              className={`p-3 rounded-lg border-2 font-semibold text-sm transition-all duration-300 ${
                                recurringFrequency === option.value
                                  ? 'border-green-500 bg-green-50 text-green-800'
                                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-green-600">
                        🔄 You can cancel anytime. Thank you for your ongoing support!
                      </p>
                    </div>
                  )}
                </div>

                {/* Donation Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-800 mb-4">Donation Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Cause:</span>
                      <span className="font-semibold">{selectedCauseData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(getCurrentAmount() || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frequency:</span>
                      <span className="font-semibold">
                        {isRecurring ? frequencyOptions.find(f => f.value === recurringFrequency)?.label : 'One-time'}
                      </span>
                    </div>
                    {isRecurring && (
                      <div className="flex justify-between text-green-700">
                        <span>Annual Impact:</span>
                        <span className="font-bold">
                          {formatCurrency((getCurrentAmount() || 0) * (frequencyOptions.find(f => f.value === recurringFrequency)?.multiplier || 1))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Donate Button */}
                <button 
                  onClick={handleDonate}
                  disabled={!getCurrentAmount()}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-6 h-6" />
                  Donate Securely with Stripe
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 Your donation is secure and encrypted. We never store your payment information.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Impact Tracker */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-700" />
                Your Impact
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">
                    {formatCurrency(getCurrentAmount() || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Your donation</div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {getCurrentAmount() >= 500 ? '🌟 Sponsors a full week of community programs' :
                     getCurrentAmount() >= 250 ? '🏫 Funds Islamic education for 5 children for a month' :
                     getCurrentAmount() >= 100 ? '📚 Provides Quran copies for new Muslims' :
                     getCurrentAmount() >= 50 ? '🍽️ Feeds 10 families during community iftar' :
                     '❤️ Every dollar helps strengthen our community'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-3">Tax Deductible</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                MAS Queens is a 501(c)(3) organization. Your donation is tax-deductible 
                to the full extent allowed by law. Tax ID: 12-3456789
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Why Donate */}
        <div className="mt-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Why Your Donation Matters</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Maintain Our Sacred Space</h3>
              <p className="text-gray-600">
                Your donations help us keep our masjid clean, safe, and welcoming for all worshippers.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Support Education</h3>
              <p className="text-gray-600">
                Fund Islamic education programs, Quran classes, and educational resources for all ages.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Strengthen Community</h3>
              <p className="text-gray-600">
                Enable community events, youth programs, and outreach initiatives that bring us together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}