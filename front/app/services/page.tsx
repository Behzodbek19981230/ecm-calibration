import type { Metadata } from 'next';
import ServicesSection from '@/components/sections/ServicesSection';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';

export const metadata: Metadata = {
	title: 'Xizmatlar — Kalibrlash xizmatlari',
	description:
		"ECM CALIBRATION kalibrlash xizmatlari: tarozi, harorat, bosim, hajm, o'lcham, elektr, kuch, moment va qattiqlik o'lchov asboblarini ISO/IEC 17025:2017 standartiga muvofiq kalibrlash.",
	openGraph: {
		title: 'Xizmatlar — ECM CALIBRATION',
		description: "Tarozi, harorat, bosim va boshqa o'lchov asboblarini professional kalibrlash xizmatlari.",
		images: [{ url: '/hero-bg.jpg', width: 1200, height: 630, alt: 'ECM CALIBRATION Xizmatlar' }],
	},
	twitter: {
		title: 'Xizmatlar — ECM CALIBRATION',
		description: "O'lchov asboblarini professional kalibrlash xizmatlari.",
		images: ['/hero-bg.jpg'],
	},
	alternates: { canonical: 'https://ecm-calibration.uz/services' },
};

export default function ServicesPage() {
	return (
		<>
			<PageHero sectionKey='services' />
			<ServicesSection />
			<CTASection />
		</>
	);
}
