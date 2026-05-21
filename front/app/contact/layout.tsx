import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: "Aloqa — Bog'lanish",
	description:
		"ECM CALIBRATION bilan bog'laning: +998 50 303 88 08. Toshkent viloyati, Zangiota tumani. Kalibrlash xizmatlari bo'yicha konsultatsiya va buyurtma.",
	openGraph: {
		title: 'Aloqa — ECM CALIBRATION',
		description: "ECM CALIBRATION bilan bog'laning. Kalibrlash xizmatlari bo'yicha konsultatsiya va buyurtma.",
		images: [{ url: '/hero-bg.jpg', width: 1200, height: 630, alt: 'ECM CALIBRATION Aloqa' }],
	},
	twitter: {
		title: 'Aloqa — ECM CALIBRATION',
		description: "ECM CALIBRATION bilan bog'laning. Kalibrlash xizmatlari bo'yicha konsultatsiya.",
		images: ['/hero-bg.jpg'],
	},
	alternates: { canonical: 'https://ecm-calibration.uz/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
	return children;
}
