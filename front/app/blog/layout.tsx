import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Blog — Metrologiya va kalibrlash',
	description:
		"ECM CALIBRATION blog: metrologiya, kalibrlash texnologiyalari, ISO standartlar va O'zbekistondagi o'lchov sanoatiga oid yangiliklar va maqolalar.",
	openGraph: {
		title: 'Blog — ECM CALIBRATION',
		description: "Metrologiya, kalibrlash texnologiyalari va ISO standartlar bo'yicha foydali maqolalar.",
		images: [{ url: '/hero-bg.jpg', width: 1200, height: 630, alt: 'ECM CALIBRATION Blog' }],
	},
	twitter: {
		title: 'Blog — ECM CALIBRATION',
		description: "Metrologiya va kalibrlash bo'yicha foydali maqolalar.",
		images: ['/hero-bg.jpg'],
	},
	alternates: { canonical: 'https://ecm-calibration.uz/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return children;
}
