import type { Metadata } from 'next';
import AboutSection from '@/components/sections/AboutSection';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';

export const metadata: Metadata = {
	title: 'Biz haqimizda — ECM CALIBRATION MChJ',
	description:
		"«ECM CALIBRATION» MChJ — ISO/IEC 17025:2017 xalqaro standart talablariga muvofiq o'lchov asboblarini kalibrlash xizmatlarini ko'rsatuvchi zamonaviy metrologiya tashkiloti. Toshkent, O'zbekiston.",
	openGraph: {
		title: 'Biz haqimizda — ECM CALIBRATION',
		description:
			"ISO/IEC 17025:2017 standartiga mos zamonaviy metrologiya tashkiloti. O'zbekistonda ishonchli kalibrlash laboratoriyasi.",
		images: [{ url: '/hero-bg.jpg', width: 1200, height: 630, alt: 'ECM CALIBRATION haqida' }],
	},
	twitter: {
		title: 'Biz haqimizda — ECM CALIBRATION',
		description: 'ISO/IEC 17025:2017 standartiga mos zamonaviy metrologiya tashkiloti.',
		images: ['/hero-bg.jpg'],
	},
	alternates: { canonical: 'https://ecm-calibration.uz/about' },
};

export default function AboutPage() {
	return (
		<>
			<PageHero sectionKey='about' />
			<AboutSection />
			<CTASection />
		</>
	);
}
