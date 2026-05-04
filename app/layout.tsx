import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://aura.lab'),
  title: 'Aura Lab — Diagnose your fit',
  description: 'Upload a fit. Get the verdict. Free, brutal, instant.',
  openGraph: {
    title: 'Aura Lab — Diagnose your fit',
    description: 'Upload a fit. Get the verdict. Free, brutal, instant.',
    images: ['/api/og/default'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Lab — Diagnose your fit',
    description: 'Upload a fit. Get the verdict. Free, brutal, instant.',
    images: ['/api/og/default'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
