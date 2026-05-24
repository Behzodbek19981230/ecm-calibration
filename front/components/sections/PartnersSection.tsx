'use client';

import Image from 'next/image';
import { useLang } from '@/lib/LanguageContext';
import { Language } from '@/lib/i18n';

const partners: {
	id: string;
	name: string;
	url: string;
	description: Record<Language, string>;
	abbr: string;
	color: string;
	bgColor: string;
	logo?: string;
}[] = [
	{
		id: 'uztest',
		name: 'UzTest',
		abbr: 'UT',
		url: 'https://uztest.uz/',
		logo: 'https://uztest.uz/wp-content/uploads/2024/09/logo.png',
		description: {
			uz: "Mahsulotlarni sinov va sertifikatlash markazi",
			ru: 'Центр испытаний и сертификации продукции',
			en: 'Product Testing and Certification Center',
		},
		color: '#1d4ed8',
		bgColor: '#dbeafe',
	},
	{
		id: 'artel',
		name: 'Artel Electronics',
		abbr: 'AR',
		url: 'https://artelelectronics.com/',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Shilda_Artel.svg/1280px-Shilda_Artel.svg.png',
		description: {
			uz: "Elektron va maishiy texnika ishlab chiqaruvchi",
			ru: 'Производитель электроники и бытовой техники',
			en: 'Electronics and home appliance manufacturer',
		},
		color: '#dc2626',
		bgColor: '#fee2e2',
	},
	{
		id: 'imzo',
		name: 'Imzo.uz',
		abbr: 'IM',
		url: 'https://imzo.uz/',
		logo: 'https://imzo.uz/uploads/logo.svg',
		description: {
			uz: "Elektron raqamli imzo xizmatlari markazi",
			ru: 'Центр услуг электронной цифровой подписи',
			en: 'Electronic digital signature services center',
		},
		color: '#7c3aed',
		bgColor: '#ede9fe',
	},
	{
		id: 'texnopark',
		name: 'Texnopark',
		abbr: 'TP',
		url: 'https://texnopark.uz/',
		logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNwYu0PXe89tZAmFe0Sp2FnoRenG8Bijs9dA&s',
		description: {
			uz: "Innovatsion texnologiyalar va startaplar markazi",
			ru: 'Центр инновационных технологий и стартапов',
			en: 'Innovation technologies and startups center',
		},
		color: '#059669',
		bgColor: '#d1fae5',
	},
	{
		id: 'premier',
		name: 'Premier Certification Center',
		abbr: 'PC',
		url: 'https://premier-sert.uz/',
		description: {
			uz: "Sertifikatlash va akkreditatsiya xizmatlari",
			ru: 'Услуги по сертификации и аккредитации',
			en: 'Certification and accreditation services',
		},
		color: '#b45309',
		bgColor: '#fef3c7',
	},
	{
		id: 'ansorsafety',
		name: 'Ansor Safety',
		abbr: 'AS',
		url: 'https://www.ansorsafety.uz/',
		logo: 'https://www.ansorsafety.uz/static/media/logo.a7d33128.png',
		description: {
			uz: "Mehnat xavfsizligi va sanoat himoyasi yechimlari",
			ru: 'Решения в области охраны труда и промышленной безопасности',
			en: 'Occupational health and industrial safety solutions',
		},
		color: '#ea580c',
		bgColor: '#ffedd5',
	},
	{
		id: 'texniksinovlar',
		name: 'Texnik Sinovlar',
		abbr: 'TS',
		url: 'https://texniksinovlar.uz/',
		logo: 'https://static.tildacdn.one/tild3034-6131-4934-b265-333763636637/Screenshot_1-removeb.png',
		description: {
			uz: "Texnik sinov va ekspertiza xizmatlari",
			ru: 'Услуги технических испытаний и экспертизы',
			en: 'Technical testing and expertise services',
		},
		color: '#0d9488',
		bgColor: '#ccfbf1',
	},
	{
		id: 'asiapowersun',
		name: 'Asia Power Sun',
		abbr: 'AP',
		url: 'https://asiapowersun.com/en',
		logo: 'https://asiapowersun.com/icons/logo.svg',
		description: {
			uz: "Quyosh energetikasi va muqobil energiya yechimlari",
			ru: 'Решения в области солнечной и альтернативной энергетики',
			en: 'Solar and alternative energy solutions',
		},
		color: '#ca8a04',
		bgColor: '#fef9c3',
	},
	{
		id: 'correctresult',
		name: 'Correct Result Group',
		abbr: 'CR',
		url: 'https://correct-results.uz/',
		logo: 'https://correct-results.uz/wp-content/uploads/2023/01/logo.png',
		description: {
			uz: "Sifat boshqaruvi va audit xizmatlari",
			ru: 'Услуги управления качеством и аудита',
			en: 'Quality management and audit services',
		},
		color: '#4f46e5',
		bgColor: '#e0e7ff',
	},
	{
		id: 'lps',
		name: 'Lab & Production Solution',
		abbr: 'LP',
		url: 'https://www.lps.uz/en/',
		logo: 'https://www.lps.uz/upload/CMax/136/1368b82ddaff3abf42898e02a8623ebf.png',
		description: {
			uz: "Laboratoriya va ishlab chiqarish uchun yechimlar",
			ru: 'Решения для лаборатории и производства',
			en: 'Solutions for laboratory and production',
		},
		color: '#0891b2',
		bgColor: '#cffafe',
	},
];

export default function PartnersSection() {
	const { t } = useLang();

	return (
		<section id='hamkorlar' className='py-12 sm:py-16 lg:py-20 bg-secondary/30'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='text-center mb-12'>
					<span className='inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4'>
						{t.partners.badge}
					</span>
					<h2
						className='text-3xl sm:text-4xl font-bold text-foreground mb-4'
						style={{ fontFamily: 'var(--font-display)' }}
					>
						{t.partners.title}
					</h2>
					<p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto'>
						{t.partners.subtitle}
					</p>
				</div>

				<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5'>
					{partners.map((partner, index) => (
						<a
							key={partner.id}
							href={partner.url}
							target='_blank'
							rel='noopener noreferrer'
							className='group flex flex-col overflow-hidden bg-card rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 border border-border/50 animate-fade-up'
							style={{ animationDelay: `${index * 60}ms` }}
						>
							<div className='w-full h-24 flex items-center justify-center bg-white overflow-hidden'>
								{partner.logo ? (
									<Image
										src={partner.logo}
										alt={partner.name}
										width={160}
										height={96}
										className='w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105'
									/>
								) : (
									<span
										className='text-2xl font-bold transition-transform duration-300 group-hover:scale-105'
										style={{ color: partner.color }}
									>
										{partner.abbr}
									</span>
								)}
							</div>
							<div className='px-3 py-2.5 border-t border-border/40'>
								<p className='text-xs font-semibold text-center text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200'>
									{partner.name}
								</p>
							</div>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}
