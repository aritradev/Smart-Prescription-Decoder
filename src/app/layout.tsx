import type { Metadata } from 'next';
import { Inter, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import CustomToaster from '@/components/ui/CustomToaster';
import GoogleAuthModal from '@/components/auth/GoogleAuthModal';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Smart Rx Decoder — AI Medical Prescription Reader & Pricing',
  description: 'Instantly decode handwritten medical prescriptions, extract medications, retrieve live BDT prices from Medex.bd, and find generic alternatives using Gemini AI.',
  keywords: ['prescription decoder', 'medical AI', 'medex bangladesh', 'generic medicine bangladesh', 'bdt medicine price'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${hindSiliguri.variable} light`}>
      <body className="bg-mesh min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <CustomToaster />
              {children}
              <GoogleAuthModal />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
