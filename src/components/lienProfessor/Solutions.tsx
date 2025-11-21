import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const cards = [
  {
    name: 'Do It Yourself Lien Kits',
    subtitle: 'Attorney-drafted forms and instructions you can reuse.',
    bullets: [
      'State-specific lien and payment bond templates',
      'Step-by-step filing and service instructions',
      'Checklists and sample language',
    ],
    price: 'Starting at $199',
    cta: 'Browse DIY Kits',
    href: '/kits/all',
    featured: false,
  },
  {
    name: 'Self-Guided + Attorney Review',
    subtitle: 'Use a kit and have a lawyer review it before you send.',
    bullets: [
      'Everything in DIY kits',
      'Attorney review of your completed documents',
      'Clarification on deadlines and next steps',
    ],
    price: 'Custom pricing per project',
    cta: 'Request Attorney Review',
    href: '/learn',
    featured: true,
  },
  {
    name: 'Top to Bottom Representation',
    subtitle: 'Let a lawyer handle the entire lien process.',
    bullets: [
      'Evaluation of your claim and deadlines',
      'Preparation, filing, and service of lien documents',
      'Coordination with payment bond claims when applicable',
    ],
    price: 'With Lovein Ribman, P.C. Firm',
    cta: 'Talk with a Lawyer',
    href: '/learn',
    featured: false,
  },
];

export const SolutionCardsSection: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="max-w-screen-2xl mx-auto px-6 py-6">
      <div className={`text-center max-w-3xl mx-auto mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-brand-600">Popular Lien Solutions</p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mt-4 mb-4 leading-tight">
          Choose the Level of Help That Fits Your&nbsp;Project
        </h2>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
          Start with a DIY lien kit, add attorney review, or retain a lawyer for complete&nbsp;representation.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {cards.map((card, index) => (
          <div
            key={card.name}
            className={`group rounded-3xl border bg-white dark:bg-slate-900 p-6 lg:p-8 flex flex-col gap-6 transition-all duration-700 shadow-sm hover:shadow-2xl hover:-translate-y-2 ${card.featured ? 'border-brand-300 dark:border-brand-700 bg-gradient-to-br from-brand-50/80 to-white dark:from-brand-950/50 dark:to-slate-900 relative ring-2 ring-brand-200 dark:ring-brand-800' : 'border-slate-200 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800'
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {card.featured && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-700 text-white px-4 py-1 text-xs font-bold shadow-lg">
                Most Popular
              </Badge>
            )}
            <div>
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wide font-semibold">
                {card.featured ? 'Premium Support' : (index === 2 ? 'Attorney-Guided' : 'Self-Guided')}
              </p>
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-2 leading-tight">{card.name}</h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2 text-base md:text-lg leading-relaxed">{card.subtitle}</p>
            </div>
            <ul className="space-y-3 text-sm md:text-base text-slate-600 dark:text-slate-300">
              {card.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">{card.price}</p>
              <a
                href={card.href}
                className={`w-full inline-flex justify-center items-center rounded-2xl px-5 py-3.5 font-semibold transition-all duration-300 ${card.featured
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:scale-105'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 hover:scale-105'
                  }`}
              >
                {card.cta}
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SolutionCardsSection;
