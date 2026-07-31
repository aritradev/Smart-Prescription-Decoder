import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import CustomToaster from '@/components/ui/CustomToaster';
import GoogleAuthModal from '@/components/auth/GoogleAuthModal';

export const metadata: Metadata = {
  title: 'Smart Rx Decoder — AI Medical Prescription Reader & Pricing',
  description: 'Instantly decode handwritten medical prescriptions, extract medications, retrieve live BDT prices from Medex.bd, and find generic alternatives using Gemini AI.',
  keywords: ['prescription decoder', 'medical AI', 'medex bangladesh', 'generic medicine bangladesh', 'bdt medicine price'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
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
