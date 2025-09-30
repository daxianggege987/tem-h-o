import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Temporal Harmony Oracle - CN',
  description: '探索时间与传统的交汇，发现深刻见解。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap" rel="stylesheet" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4374876928430270"
          crossOrigin="anonymous"></script>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <footer className="w-full text-center py-4">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary">
              鲁ICP备2025142055号-1
            </a>
          </footer>
          <Toaster />
        </AuthProvider>
        <Script
          id="wukong-analytics"
          strategy="afterInteractive"
          src="https://api.wukongtongji.com/c?_=800710351182897152"
        />
      </body>
    </html>
  );
}
