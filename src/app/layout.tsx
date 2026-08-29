import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/lib/authContext';
import { PropertyProvider } from '@/lib/propertyContext';

export const metadata: Metadata = {
  title: 'Rabnix Estate - Buy, Rent, PG & AI Property Valuation',
  description: 'India’s premier real estate platform by Rabnix Estate for buying, selling, and renting properties with zero brokerage and AI valuation.',
  openGraph: {
    title: 'Rabnix Estate - India Real Estate Platform',
    description: 'Find homes, commercial properties, and lands with AI valuation on Rabnix Estate.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rabnix Estate - India Real Estate Platform',
    description: 'Find homes, commercial properties, and lands with AI valuation on Rabnix Estate.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          <PropertyProvider>
            {children}
          </PropertyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
