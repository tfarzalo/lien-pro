import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileText, Clock3 } from 'lucide-react';

const benefits = [
	{ label: 'No upfront cost to get started', icon: CheckCircle2 },
	{ label: 'Attorney-drafted forms', icon: FileText },
	{ label: 'Takes about 10 minutes', icon: Clock3 },
];

export const HeroSection: React.FC = () => {
	return (
		<section className="bg-gradient-to-b from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 pt-12 md:pt-16 pb-0 text-slate-900 dark:text-white overflow-hidden">
			<div className="max-w-screen-2xl mx-auto pl-10 pr-6">
				{/* Mobile: Chalkboard at Top */}
				<div className="block lg:hidden mb-8 animate-fade-in-up">
					<div className="relative max-w-md mx-auto">
						<div className="absolute inset-0 bg-gradient-to-tr from-brand-200/20 via-amber-200/20 to-brand-200/20 blur-3xl rounded-3xl" aria-hidden />
						<div className="relative">
							<img
								src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lien-professor-chalkboard-1.png"
								alt="Lien Professor - Your Expert Guide"
								className="w-full h-auto rounded-xl"
								loading="eager"
							/>
						</div>
					</div>
				</div>

				{/* Desktop Grid */}
				<div className="grid gap-8 lg:gap-12 lg:grid-cols-[45%_55%]">
					<div className="space-y-6 md:space-y-8 pb-8 md:pb-12 lg:pb-20 lg:pt-4 animate-fade-in-left">
						<div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100/80 px-4 py-1 text-sm font-medium text-brand-700 hover:scale-105 transition-transform">
							Trusted by 1,000+ contractors
						</div>
						<div className="space-y-4">
							<h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] tracking-tight text-slate-900 dark:text-white">
								Protect Your Payment Rights with Texas&nbsp;Lien&nbsp;Law
							</h1>
							<p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
								The Lien Professor™ gives you the knowledge, step-by-step instructions, and attorney-drafted documents to prepare, file, and enforce construction liens and payment bond claims with&nbsp;confidence.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							<Link
								to="/assessment"
								className="group inline-flex justify-center items-center px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold shadow-lg shadow-brand-200/60 hover:bg-brand-500 hover:shadow-xl hover:scale-105 transition-all duration-200"
							>
								Start Free Assessment
								<svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</Link>
							<Link
								to="/kits"
								className="inline-flex justify-center items-center px-6 py-3 rounded-xl border-2 border-brand-300 text-brand-700 font-semibold bg-white hover:bg-brand-50 hover:border-brand-400 hover:scale-105 transition-all duration-200 dark:bg-slate-900 dark:text-white dark:border-slate-700 dark:hover:bg-slate-800"
							>
								Browse Lien Kits
							</Link>
						</div>

						<div className="grid gap-4 sm:grid-cols-3">
							{benefits.map((item, index) => (
								<div 
									key={item.label} 
									className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none animate-fade-in-up"
									style={{ animationDelay: `${index * 100}ms` }}
								>
									<item.icon className="h-5 w-5 text-brand-600 flex-shrink-0" />
									<p className="text-sm text-slate-700 leading-snug dark:text-slate-200">{item.label}</p>
								</div>
							))}
						</div>
					</div>

					<div className="hidden lg:flex relative items-end pb-16 pt-12 xl:pb-20 xl:pt-16 animate-fade-in-right">
						{/* Decorative glow effect */}
						<div className="absolute inset-0 bg-gradient-to-tr from-brand-200/25 via-amber-200/25 to-brand-200/25 blur-3xl rounded-3xl dark:from-brand-900/25 dark:via-amber-900/25 dark:to-brand-900/25" aria-hidden />

						{/* Chalkboard Image Container */}
						<div className="relative w-full">
							<img
								src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lien-professor-chalkboard-1.png"
								alt="Lien Professor - Your Expert Guide"
								className="w-full h-auto rounded-xl"
								loading="eager"
								style={{ maxHeight: '480px', objectFit: 'contain', objectPosition: 'bottom' }}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
