import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const siteUrl = 'https://ecm-calibration.uz';

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "ECM CALIBRATION — O'lchov asboblarini kalibrlash | Toshkent",
		template: '%s | ECM CALIBRATION',
	},
	description:
		"ECM CALIBRATION — ISO/IEC 17025:2017 xalqaro standartiga muvofiq o'lchov asboblarini kalibrlash xizmatlari. Профессиональная калибровка средств измерений в Ташкенте. Professional calibration services in Uzbekistan.",
	keywords: [
		'kalibrlash',
		'calibration',
		'калибровка',
		'ECM Calibration',
		'ISO 17025',
		'metrologiya',
		'метрология',
		"o'lchov asboblari",
		'средства измерений',
		'Toshkent',
		'Ташкент',
		'Uzbekistan',
		'Узбекистан',
		'kalibrlash laboratoriyasi',
		'лаборатория калибровки',
	],
	authors: [{ name: 'ECM CALIBRATION', url: siteUrl }],
	creator: 'ECM CALIBRATION',
	publisher: 'ECM CALIBRATION MChJ',
	robots: {
		index: true,
		follow: true,
		googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
	},
	icons: {
		icon: [
			{ url: '/logo.png', type: 'image/png', sizes: '16x16' },
			{ url: '/logo.png', type: 'image/png', sizes: '32x32' },
			{ url: '/logo.png', type: 'image/png', sizes: '192x192' },
			{ url: '/logo.png', type: 'image/png', sizes: 'any' },
		],
		apple: [{ url: '/logo.png', type: 'image/png', sizes: '180x180' }],
		shortcut: [{ url: '/logo.png', type: 'image/png' }],
	},
	openGraph: {
		type: 'website',
		locale: 'uz_UZ',
		alternateLocale: ['ru_RU', 'en_US'],
		url: siteUrl,
		siteName: 'ECM CALIBRATION',
		title: "ECM CALIBRATION — O'lchov asboblarini kalibrlash",
		description:
			'ISO/IEC 17025:2017 xalqaro standartiga muvofiq professional kalibrlash xizmatlari. Toshkentda ishonchli metrologiya laboratoriyasi.',
		images: [
			{
				url: '/hero-bg.jpg',
				width: 1200,
				height: 630,
				alt: "ECM CALIBRATION — O'lchov asboblarini kalibrlash laboratoriyasi",
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: "ECM CALIBRATION — O'lchov asboblarini kalibrlash",
		description:
			'ISO/IEC 17025:2017 xalqaro standartiga muvofiq professional kalibrlash xizmatlari. Toshkentda ishonchli metrologiya laboratoriyasi.',
		images: ['/hero-bg.jpg'],
	},
	alternates: {
		canonical: siteUrl,
		languages: {
			'uz-UZ': `${siteUrl}/`,
			'ru-RU': `${siteUrl}/`,
			'en-US': `${siteUrl}/`,
		},
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='uz'>
			<body className='min-h-screen flex flex-col antialiased'>
				<LanguageProvider>
					<Navbar />
					<main className='flex-1'>{children}</main>
					<Footer />
				</LanguageProvider>
			</body>
		</html>
	);
}
