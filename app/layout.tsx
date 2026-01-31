import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Content Review Database',
  description: 'Your personal movie and TV show review database',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
