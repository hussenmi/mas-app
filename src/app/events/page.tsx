'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) {
          throw new Error('Could not load events. Please try again later.');
        }
        const data = await res.json();
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg min-h-[calc(100vh-250px)] flex flex-col justify-center">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">Upcoming Events</h1>
      {loading ? (
        <p className="text-center text-gray-700 text-lg">Loading events...</p>
      ) : error ? (
        <p className="text-center text-red-600 font-semibold text-lg">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? events.map((event) => (
            <a href={event.browser_url} key={event.id} target="_blank" rel="noopener noreferrer" className="block bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <h2 className="text-xl font-bold text-green-800 mb-2">{event.title}</h2>
              <p className="text-gray-600 text-sm mb-1">{event.sponsoring_organization.name}</p>
              <p className="text-sm text-gray-500 font-medium">{dayjs(event.timeslots[0]?.start_date * 1000).format('dddd, MMMM D, YYYY @ h:mm A')}</p>
            </a>
          )) : <p className="text-center text-gray-600 col-span-full text-lg">No upcoming events found.</p>}
        </div>
      )}
    </div>
  );
}