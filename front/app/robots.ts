import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
			},
		],
		sitemap: 'https://ecm-calibration.uz/sitemap.xml',
		host: 'https://ecm-calibration.uz',
	};
}
