import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileText, Clock3 } from 'lucide-react';
import { AssessmentCTA } from '@/components/common/AssessmentCTA';
import { NextDeadlineCounter } from '@/components/common/NextDeadlineCounter';

const benefits = [
  { label: 'No upfront cost to get started', icon: CheckCircle2 },
  { label: 'Attorney-drafted forms', icon: FileText },
  { label: 'Takes about 10 minutes', icon: Clock3 },
];

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-28 pb-4 text-slate-900 dark:text-white overflow-hidden">
      {/* Construction Machine Background Overlay - Top Right */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full opacity-10 dark:opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url(https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lp-bg-construction-machine.png)',
          backgroundPosition: 'top right',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
        aria-hidden
      />
      
      <div className="mx-auto pl-10 pr-6 relative z-10" style={{ maxWidth: '1400px' }}>
        {/* Mobile: Lien Professor Robert at Top */}
        <div className="block lg:hidden mb-8 animate-fade-in-up">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/20 via-slate-200/20 to-blue-200/20 blur-3xl rounded-3xl" aria-hidden />
            <div className="relative">
              <img
                src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lien-professor-robert.png"
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
            {/* Next Deadline Counter - Hidden per user request */}
            <div className="hidden">
              <NextDeadlineCounter />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-1.5 text-sm font-medium text-amber-900 dark:text-amber-100 hover:scale-105 transition-transform">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-amber-500" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>Over 925 5-Star Reviews</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight text-slate-900 dark:text-white">
                Protect Your Payment Rights with Texas&nbsp;Lien&nbsp;Law
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                The Lien Professor™ gives you the knowledge, step-by-step instructions, and attorney-drafted documents to prepare, file, and enforce construction liens and payment bond claims with&nbsp;confidence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <AssessmentCTA
                variant="primary"
                size="lg"
                className="text-base px-10 py-4 h-auto rounded-xl shadow-lg shadow-brand-200/60 hover:shadow-xl hover:scale-105 transition-all duration-200"
              />
              <Link
                to="/kits"
                className="inline-flex items-center justify-center rounded-xl px-10 py-4 text-base font-semibold border-2 border-brand-300 text-brand-700 bg-white hover:bg-brand-50 hover:border-brand-400 hover:scale-105 transition-all duration-200 shadow-lg shadow-slate-200/60 hover:shadow-xl dark:bg-slate-900 dark:text-white dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Browse Legal Kits
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
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/25 via-slate-200/25 to-blue-200/25 blur-3xl rounded-3xl dark:from-blue-900/25 dark:via-slate-900/25 dark:to-blue-900/25" aria-hidden />

            {/* Construction Machine Background Layer */}
            <div className="absolute inset-0 flex items-start justify-start mt-8" style={{ marginLeft: '-10rem' }}>
              <img
                src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lp-bg-construction-machine.png"
                alt=""
                className="w-full h-auto opacity-80 dark:opacity-60"
                style={{ maxHeight: '540px', objectFit: 'contain', objectPosition: 'top' }}
                aria-hidden
              />
            </div>

            {/* Lien Professor Robert Image Container (Foreground) */}
            <div className="relative w-full z-10">
              <img
                src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lien-professor-robert.png"
                alt="Lien Professor - Your Expert Guide"
                className="w-full h-auto rounded-xl"
                loading="eager"
                style={{ maxHeight: '640px', objectFit: 'contain', objectPosition: 'bottom' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
