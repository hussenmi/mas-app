
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VolunteerPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false); // New state for submission status

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      if (res.ok) {
        setMessage('Thank you for signing up! You can now sign in.');
        setSubmitted(true); // Set submitted to true on success
        // No need to clear form fields if we're hiding the form
      } else {
        const errorData = await res.text();
        setMessage(`Error: ${errorData || 'Something went wrong.'}`);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      setMessage('Error: Could not connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">Volunteer Sign-Up</h1>
        <p className="text-gray-600 text-center mb-6 text-lg leading-relaxed">Join our team and help make a difference in the community!</p>

        {submitted ? (
          <div className="text-center text-green-700 font-semibold text-xl py-8">
            <p>Thank you for your interest in volunteering!</p>
            <p>We have received your information and will be in touch soon.</p>
            <Link href="/signin" className="text-green-600 hover:underline mt-4 block">Go to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input
                type="text"
                id="name"
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
              <input
                type="email"
                id="email"
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
              <input
                type="tel"
                id="phone"
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
              <input
                type="password"
                id="password"
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing Up...' : 'Sign Up Now'}
            </button>
          </form>
        )}

        {message && !submitted && (
          <p className={`mt-4 text-center ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'} text-sm`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
