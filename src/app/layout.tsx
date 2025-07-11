import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider

export const metadata: Metadata = {
  title: 'Temporal Harmony Oracle',
  description: 'Discover insights from the confluence of time and tradition.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap" rel="stylesheet" />
        <Script
          id="wukong-analytics"
          strategy="beforeInteractive"
          src="//api.wukongtongji.com/c?_=800710351182897152"
        />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4374876928430270"
          crossOrigin="anonymous"></script>
      </head>
      <body className="font-body antialiased">
        <AuthProvider> {/* Wrap children with AuthProvider */}
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
