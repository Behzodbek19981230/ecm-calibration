import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const jsonLd = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Organization',
			'@id': 'https://ecm-calibration.uz/#organization',
			name: 'ECM CALIBRATION',
			legalName: 'ECM CALIBRATION MChJ',
			url: 'https://ecm-calibration.uz',
			logo: {
				'@type': 'ImageObject',
				url: 'https://ecm-calibration.uz/logo.png',
				width: 512,
				height: 512,
			},
			contactPoint: {
				'@type': 'ContactPoint',
				telephone: '+998503038808',
				email: 'ecm.calibration.llc@gmail.com',
				contactType: 'customer service',
				availableLanguage: ['Uzbek', 'Russian', 'English'],
			},
			address: {
				'@type': 'PostalAddress',
				streetAddress: "Dustlik ko'chasi, 8-uy, Bog'zor MFY",
				addressLocality: 'Zangiota tumani',
				addressRegion: 'Toshkent viloyati',
				addressCountry: 'UZ',
			},
			sameAs: [
				'https://t.me/ecmcalibration',
				'https://instagram.com/ecmcalibration',
			],
		},
		{
			'@type': 'LocalBusiness',
			'@id': 'https://ecm-calibration.uz/#localbusiness',
			name: 'ECM CALIBRATION',
			image: 'https://ecm-calibration.uz/hero-bg.jpg',
			url: 'https://ecm-calibration.uz',
			telephone: '+998503038808',
			email: 'ecm.calibration.llc@gmail.com',
			description:
				"ISO/IEC 17025:2017 xalqaro standartiga muvofiq o'lchov asboblarini kalibrlash xizmatlari. Toshkentda ishonchli metrologiya laboratoriyasi.",
			address: {
				'@type': 'PostalAddress',
				streetAddress: "Dustlik ko'chasi, 8-uy, Bog'zor MFY",
				addressLocality: 'Zangiota tumani',
				addressRegion: 'Toshkent viloyati',
				addressCountry: 'UZ',
			},
			geo: {
				'@type': 'GeoCoordinates',
				latitude: 41.11675,
				longitude: 69.07091,
			},
			openingHoursSpecification: {
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
				opens: '09:00',
				closes: '18:00',
			},
			priceRange: '$$',
			currenciesAccepted: 'UZS',
			paymentAccepted: 'Cash, Bank Transfer',
		},
		{
			'@type': 'WebSite',
			'@id': 'https://ecm-calibration.uz/#website',
			url: 'https://ecm-calibration.uz',
			name: 'ECM CALIBRATION',
			inLanguage: ['uz', 'ru', 'en'],
			publisher: { '@id': 'https://ecm-calibration.uz/#organization' },
		},
	],
};

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
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</body>
		</html>
	);
}
