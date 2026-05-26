import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Akkreditatsiya doirasi — ISO/IEC 17025:2017",
  description:
    "ECM CALIBRATION akkreditatsiya doirasi: ISO/IEC 17025:2017 standartiga muvofiq kalibrlash sertifikatlari, o'lchov asboblari ro'yxati va texnik imkoniyatlar.",
  openGraph: {
    title: "Akkreditatsiya doirasi — ECM CALIBRATION",
    description:
      "ISO/IEC 17025:2017 standartiga muvofiq akkreditatsiya doirasi va kalibrlash sertifikatlari.",
    images: [{ url: '/hero-bg.jpg', width: 1200, height: 630, alt: 'ECM CALIBRATION Akkreditatsiya' }],
  },
  twitter: {
    title: "Akkreditatsiya doirasi — ECM CALIBRATION",
    description: "ISO/IEC 17025:2017 standartiga muvofiq akkreditatsiya doirasi.",
    images: ['/hero-bg.jpg'],
  },
  alternates: { canonical: 'https://ecm-calibration.uz/accreditation' },
};

export default function AccreditationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
