import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: "ECM CALIBRATION - O'lchov asboblarini kalibrlash | Калибровка средств измерений | Calibration Services",
  description: "ECM CALIBRATION - ISO/IEC 17025:2017 xalqaro standartiga muvofiq o'lchov asboblarini kalibrlash xizmatlari. Профессиональная калибровка средств измерений в Ташкенте. Professional calibration services in Uzbekistan.",
  keywords: "калибровка, калибровка весов, calibration services, ECM Calibration, Tashkent, kalibrlash",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
