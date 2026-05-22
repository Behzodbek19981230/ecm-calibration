'use client';

import Link from 'next/link';
import {
	Scale, Thermometer, FlaskConical, Ruler, Gauge, Zap,
	Dumbbell, Wrench, Diamond, ArrowRight,
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serviceIcons: Record<string, React.ComponentType<any>> = {
	weighing:   Scale,
	temperature: Thermometer,
	volume:     FlaskConical,
	dimensional: Ruler,
	pressure:   Gauge,
	electrical: Zap,
	force:      Dumbbell,
	torque:     Wrench,
	hardness:   Diamond,
};

export default function ServicesSection() {
	const { t } = useLang();

	const entries = Object.entries(t.services.items) as [
		string,
		{ title: string; description: string },
	][];

	return (
		<section
			id='services'
			className='py-12 sm:py-16 lg:py-24 bg-background relative overflow-hidden'
		>
			{/* Dot pattern background */}
			<div className='absolute inset-0 opacity-30'>
				<div
					className='absolute top-0 left-0 w-full h-full'
					style={{
						backgroundImage:
							'radial-gradient(circle at 1px 1px, hsl(205 45% 25% / 0.05) 1px, transparent 0)',
						backgroundSize: '40px 40px',
					}}
				/>
			</div>

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
				{/* Header */}
				<div className='text-center mb-16'>
					<span className='inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4'>
						{t.services.title}
					</span>
					<h2
						className='text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4'
						style={{ fontFamily: 'var(--font-display)' }}
					>
						{t.services.title}
					</h2>
					<p className='text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto'>
						{t.services.subtitle}
					</p>
				</div>

				{/* Cards grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{entries.map(([key, service], index) => {
						const Icon = serviceIcons[key] || Scale;
						return (
							<div
								key={key}
								className='group relative bg-card rounded-2xl p-5 sm:p-8 shadow-soft hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border border-border/50 overflow-hidden animate-fade-up'
								style={{ animationDelay: `${index * 100}ms` }}
							>
								{/* Hover gradient overlay */}
								<div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

								<div className='relative z-10'>
									{/* Icon */}
									<div className='w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300'>
										<Icon
											className='w-7 h-7 text-primary group-hover:text-accent transition-colors duration-300'
										/>
									</div>

									{/* Title */}
									<h3
										className='text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300'
										style={{ fontFamily: 'var(--font-display)' }}
									>
										{service.title}
									</h3>

									{/* Description */}
									<p className='text-muted-foreground leading-relaxed'>
										{service.description}
									</p>
								</div>

								{/* Decorative circle (bottom-right) */}
								<div className='absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full group-hover:bg-accent/10 transition-colors duration-500' />
							</div>
						);
					})}
				</div>

				{/* CTA */}
				<div className='text-center mt-12'>
					<Link
						href='/#ariza'
						className='inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-base transition-all hover:opacity-90 hover:shadow-md hover:-translate-y-0.5 group'
						style={{ background: 'var(--gradient-hero)' }}
					>
						{t.common.orderNow}
						<ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-1' />
					</Link>
				</div>
			</div>
		</section>
	);
}
