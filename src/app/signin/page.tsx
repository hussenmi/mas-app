'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Redirect to home page on successful sign-in
          router.push('/'); 
        } else {
          setMessage('Invalid credentials.');
        }
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">Volunteer Sign In</h1>
        <p className="text-gray-600 text-center mb-6 text-lg leading-relaxed">Sign in with your email and password.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center ${message.startsWith('Error') ? 'text-red-600' : 'text-red-600'} text-sm`}>
            {message}
          </p>
        )}

        <p className="mt-8 text-center text-gray-600 text-sm">
          Don&apos;t have an account? <Link href="/volunteer" className="text-green-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}