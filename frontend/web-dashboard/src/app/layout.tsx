import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SentinAI | Security Operations Center (SOC)',
  description: 'Security Operations Center for SentinAI IoT fleets and connected properties.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-background text-white min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
