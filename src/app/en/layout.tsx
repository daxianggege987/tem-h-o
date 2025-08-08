import type {Metadata} from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Temporal Harmony Oracle',
  description: 'Discover insights from the confluence of time and tradition.',
};

export default function EnLayout({
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
