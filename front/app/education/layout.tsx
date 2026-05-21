import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Ta'lim — Metrologiya kurslari",
  description:
    "ECM CALIBRATION ta'lim kurslari: metrologiya, kalibrlash usullari va ISO/IEC 17025:2017 standart bo'yicha professional treninglar. Sertifikat bilan.",
  openGraph: {
    title: "Ta'lim — ECM CALIBRATION",
    description:
      "Metrologiya va kalibrlash bo'yicha professional kurslar. ISO/IEC 17025:2017 sertifikati bilan.",
    images: [{ url: '/hero-bg.jpg', width: 1200, height: 630, alt: "ECM CALIBRATION Ta'lim kurslari" }],
  },
  twitter: {
    title: "Ta'lim — ECM CALIBRATION",
    description: "Metrologiya va kalibrlash bo'yicha professional kurslar.",
    images: ['/hero-bg.jpg'],
  },
  alternates: { canonical: 'https://ecmcalibration.uz/education' },
};

export default function EducationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
