export default function DonatePage() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "#";

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center w-full max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Support Your Masjid</h1>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          Your generous donations help us maintain the masjid, run vital programs, and serve our vibrant community.
        </p>
        <a 
          href={paymentLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-800 transition-transform transform hover:scale-105 shadow-lg text-lg"
        >
          Donate Securely
        </a>
      </div>
    </div>
  );
}