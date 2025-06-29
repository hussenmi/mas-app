import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-sm p-10 rounded-xl shadow-lg text-center w-full max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-4">
          Welcome to <span className="text-green-700">MAS Queens Connect</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 leading-relaxed">
          Your digital hub for community prayers, enriching events, and vital support.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/prayers" className="py-3 px-8 text-white bg-green-700 font-semibold rounded-lg hover:bg-green-800 transition-all duration-300 transform hover:scale-105 shadow-md">
            View Prayer Times
          </Link>
          <Link href="/events" className="py-3 px-8 text-green-800 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 shadow-md">
            See Upcoming Events
          </Link>
        </div>
      </div>
    </div>
  );
}