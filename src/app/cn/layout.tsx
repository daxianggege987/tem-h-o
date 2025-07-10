
import type {Metadata} from 'next';
import Script from 'next/script';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider

export const metadata: Metadata = {
  title: 'Temporal Harmony Oracle - CN',
  description: '探索时间与传统的交汇，发现深刻见解。',
};

export default function CnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* 
        The <Script> for wukongtongji is already in the root layout (src/app/layout.tsx), 
        so it doesn't need to be duplicated here. The root layout wraps all pages, 
        including those under /cn.
      */}
      {children}
    </>
  );
}
