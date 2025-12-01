import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoFund AI - Portugal 2030 Automation',
  description: 'Automate Portugal 2030 fund applications with AI-powered IES processing. Transform your financial statements into ready-to-submit applications in minutes.',
  keywords: ['Portugal 2030', 'IES', 'candidaturas', 'IA', 'Claude AI', 'automação', 'IAPMEI', 'finanças'],
  authors: [{ name: 'AutoFund AI Team' }],
  openGraph: {
    title: 'AutoFund AI - Portugal 2030 Automation',
    description: 'Automate Portugal 2030 fund applications with AI-powered IES processing',
    type: 'website',
    locale: 'pt_PT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoFund AI - Portugal 2030 Automation',
    description: 'Automate Portugal 2030 fund applications with AI-powered IES processing',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AutoFund AI',
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://autofund-ai.vercel.app' : 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}
