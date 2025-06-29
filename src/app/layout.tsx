import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "MAS Queens Connect",
  description: "Your connection to the MAS Queens community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-gray-100`}>
        <div 
          className="fixed inset-0 z-[-1]"
          style={{
            backgroundImage: `url(/background-pattern.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.1,
          }}
        />
        <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/mas-logo.png" alt="MAS Queens Logo" width={150} height={50} />
              </Link>
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/prayers" className="py-2 px-4 text-gray-700 font-semibold hover:text-green-800 hover:bg-gray-100 rounded transition-colors">Prayers</Link>
                <Link href="/events" className="py-2 px-4 text-gray-700 font-semibold hover:text-green-800 hover:bg-gray-100 rounded transition-colors">Events</Link>
                <Link href="/volunteer" className="py-2 px-4 text-gray-700 font-semibold hover:text-green-800 hover:bg-gray-100 rounded transition-colors">Volunteer</Link>
                <Link href="/signin" className="py-2 px-4 text-gray-700 font-semibold hover:text-green-800 hover:bg-gray-100 rounded transition-colors">Sign In</Link>
                <Link href="/donate" className="py-2 px-4 text-white bg-green-700 font-semibold rounded-lg hover:bg-green-800 transition-colors">Donate</Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}