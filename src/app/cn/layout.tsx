import type {Metadata} from 'next';
import '../globals.css';

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
      {children}
    </>
  );
}
