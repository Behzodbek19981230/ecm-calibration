'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { useLang } from '@/lib/LanguageContext';
import { Language } from '@/lib/i18n';

const langLabels: Record<Language, string> = { uz: 'UZ', ru: 'RU', en: 'GB' };
const langCountry: Record<Language, string> = { uz: 'UZ', ru: 'RU', en: 'GB' };
const langOrder: Language[] = ['uz', 'ru', 'en'];

export default function Navbar() {
	const { lang, setLang, t, company } = useLang();
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const navLinks = [
		{ href: '/', label: t.nav.home },
		{ href: '/about', label: t.nav.about },
		{ href: '/services', label: t.nav.services },
		{ href: '/accreditation', label: t.nav.accreditation },
		{ href: '/contact', label: t.nav.contact },
	];

	const LangToggle = ({ mobile = false }: { mobile?: boolean }) => (
		<div
			className={`flex items-center rounded-lg p-1 ${mobile ? 'gap-0.5' : 'gap-1'} ${
				scrolled ? 'bg-secondary/50' : 'bg-white/10'
			}`}
		>
			{langOrder.map((l) => (
				<button
					key={l}
					onClick={() => setLang(l)}
					className={`rounded-md font-medium transition-all duration-200 ${
						mobile ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
					} ${
						lang === l
							? scrolled
								? 'bg-primary text-primary-foreground shadow-soft'
								: 'bg-white/20 text-white shadow-soft'
							: scrolled
								? 'text-muted-foreground hover:text-foreground hover:bg-secondary'
								: 'text-white/60 hover:text-white hover:bg-white/10'
					}`}
				>
					<ReactCountryFlag
						countryCode={langCountry[l]}
						svg
						style={{ width: '1.1em', height: '1.1em' }}
						className={mobile ? '' : 'mr-1.5'}
					/>
					{!mobile && langLabels[l]}
				</button>
			))}
		</div>
	);

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
			}`}
		>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16 lg:h-17'>
					<Link href='/' className='shrink-0'>
						<Image
							src='/logo.png'
							alt='ECM CALIBRATION'
							width={120}
							height={40}
							className={`h-9 w-auto object-contain transition-all duration-300 ${
								scrolled ? 'brightness-100' : 'brightness-0 invert'
							}`}
							priority
						/>
					</Link>

					<nav className='hidden lg:flex items-center gap-0.5'>
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
									pathname === link.href
										? scrolled
											? 'bg-gray-100 text-gray-900 font-semibold'
											: 'bg-white/20 text-white font-semibold'
										: scrolled
											? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
											: 'text-white/85 hover:text-white hover:bg-white/10'
								}`}
							>
								{link.label}
							</Link>
						))}
					</nav>

					<div className='hidden lg:flex items-center gap-3'>
						<LangToggle />
						<a
							href={'tel:' + company.phone.replace(/\s/g, '')}
							className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
								scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
							}`}
						>
							<Phone size={14} />
							{company.phone}
						</a>
						<Link
							href='/#ariza'
							className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md ${
								scrolled ? 'bg-gray-800 hover:bg-gray-700' : ''
							}`}
							style={scrolled ? {} : { background: 'var(--gradient-accent)' }}
						>
							{t.nav.order}
						</Link>
					</div>

					<div className='flex lg:hidden items-center gap-2'>
						<LangToggle mobile />
						<button
							onClick={() => setMenuOpen(!menuOpen)}
							className={`p-2 rounded-md transition-colors ${
								scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
							}`}
						>
							{menuOpen ? <X size={22} /> : <Menu size={22} />}
						</button>
					</div>
				</div>
			</div>

			{menuOpen && (
				<div className='lg:hidden bg-white border-t border-gray-100 shadow-lg'>
					<div className='px-4 py-3 space-y-1'>
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setMenuOpen(false)}
								className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									pathname === link.href
										? 'bg-gray-100 text-gray-900 font-semibold'
										: 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
								}`}
							>
								{link.label}
							</Link>
						))}
						<a
							href={'tel:' + company.phone.replace(/\s/g, '')}
							className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700'
						>
							<Phone size={14} />
							{company.phone}
						</a>
						<Link
							href='/#ariza'
							onClick={() => setMenuOpen(false)}
							className='block mt-1 px-3 py-2.5 rounded-lg text-sm font-semibold text-white text-center bg-gray-800'
						>
							{t.nav.order}
						</Link>
					</div>
				</div>
			)}
		</header>
	);
}
