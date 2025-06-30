import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import EnhancedNavigation from "@/components/EnhancedNavigation";

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
        <EnhancedNavigation />
        <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}