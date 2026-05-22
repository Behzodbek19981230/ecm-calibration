'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function HeroSection() {
	const { t } = useLang();

	return (
		<section
			id='home'
			className='relative min-h-screen flex items-center justify-center overflow-hidden'
		>
			{/* Background image */}
			<div className='absolute inset-0 bg-cover bg-center bg-no-repeat'>
				<Image
					src='/hero-bg.jpg'
					alt=''
					fill
					priority
					className='object-cover object-center'
					sizes='100vw'
				/>
			</div>

			{/* Gradient overlay */}
			<div
				className='absolute inset-0 opacity-85'
				style={{ background: 'var(--gradient-hero)' }}
			/>

			{/* Floating decorative circles */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute top-1/4 left-1/4 w-64 h-64 border border-primary-foreground/10 rounded-full animate-float' />
				<div className='absolute bottom-1/4 right-1/4 w-48 h-48 border border-primary-foreground/10 rounded-full animate-float animation-delay-200' />
				<div className='absolute top-1/2 right-1/3 w-32 h-32 border border-primary-foreground/5 rotate-45 animate-float animation-delay-400' />
			</div>

			{/* Content */}
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20'>
				<div className='max-w-4xl mx-auto text-center'>

					{/* ISO badge */}
					<div className='animate-fade-up'>
						<span className='inline-block px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full text-primary-foreground/90 text-sm font-medium mb-6 border border-primary-foreground/20'>
							ISO/IEC 17025:2017
						</span>
					</div>

					{/* Title */}
					<h1
						className='animate-fade-up animation-delay-100 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 tracking-tight'
						style={{ fontFamily: 'var(--font-display)' }}
					>
						{t.hero.title}
					</h1>

					{/* Subtitle */}
					<p
						className='animate-fade-up animation-delay-200 text-lg sm:text-2xl md:text-3xl text-primary-foreground/80 font-medium mb-6'
						style={{ fontFamily: 'var(--font-display)' }}
					>
						{t.hero.subtitle}
					</p>

					{/* Description */}
					<p className='animate-fade-up animation-delay-300 text-sm sm:text-base md:text-lg lg:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed'>
						{t.hero.description}
					</p>

					{/* CTA buttons */}
					<div className='animate-fade-up animation-delay-400 flex flex-col sm:flex-row gap-4 justify-center'>
						<Link
							href='/#ariza'
							className='inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground hover:bg-accent-light shadow-lg hover:shadow-xl hover:-translate-y-1 font-bold h-12 sm:h-14 rounded-xl px-7 sm:px-10 text-base sm:text-lg transition-all duration-300 group'
						>
							{t.hero.cta}
							<ArrowRight className='w-5 h-5 transition-transform group-hover:translate-x-1' />
						</Link>
						<Link
							href='/services'
							className='inline-flex items-center justify-center gap-2 border-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm font-semibold h-12 sm:h-14 rounded-xl px-7 sm:px-10 text-base sm:text-lg transition-all duration-300'
						>
							{t.hero.learnMore}
						</Link>
					</div>
				</div>
			</div>

			{/* Scroll indicator */}
			<div className='absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce'>
				<ChevronDown className='w-8 h-8 text-primary-foreground/60' />
			</div>
		</section>
	);
}
