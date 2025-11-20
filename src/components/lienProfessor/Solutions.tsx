import React from 'react';
import { Badge } from '@/components/ui/Badge';

const cards = [
  {
    name: 'DIY Lien Kits',
    subtitle: 'Attorney-drafted forms and instructions you can reuse.',
    bullets: [
      'State-specific lien and payment bond templates',
      'Step-by-step filing and service instructions',
      'Checklists and sample language',
    ],
    price: 'Starting at $199',
    cta: 'Browse Lien Kits',
    href: '/kits',
    featured: false,
  },
  {
    name: 'Guided + Attorney Review',
    subtitle: 'Use a kit and have a construction lawyer review it before you send.',
    bullets: [
      'Everything in DIY kits',
      'Attorney review of your completed documents',
      'Clarification on deadlines and next steps',
    ],
    price: 'Custom pricing per project',
    cta: 'Request Attorney Review',
    href: '/contact',
    featured: true,
  },
  {
    name: 'Full Representation',
    subtitle: 'Let a construction lawyer handle the entire lien process.',
    bullets: [
      'Evaluation of your claim and deadlines',
      'Preparation, filing, and service of lien documents',
      'Coordination with payment bond claims when applicable',
    ],
    price: 'By engagement with Lovein | Ribman, P.C.',
    cta: 'Talk to a Construction Lawyer',
    href: '/contact',
    featured: false,
  },
];

export const SolutionCardsSection: React.FC = () => (
  <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="text-center max-w-3xl mx-auto mb-12">
      <p className="text-sm font-semibold tracking-[0.2em] uppercase text-brand-600">Popular Lien Solutions</p>
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-4">
        Choose the Level of Help That Fits Your Project
      </h2>
      <p className="text-lg text-slate-600">
        Start with a DIY lien kit, add attorney review, or retain a construction lawyer for complete representation.
      </p>
    </div>
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.name}
          className={`rounded-3xl border bg-white p-8 flex flex-col gap-6 transition shadow-sm hover:shadow-xl ${
            card.featured ? 'border-brand-300 bg-brand-50/60 relative ring-2 ring-brand-200' : 'border-slate-200'
          }`}
        >
          {card.featured && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-3 py-0.5">
              Most Popular
            </Badge>
          )}
          <div>
            <p className="text-sm uppercase text-slate-500 tracking-wide">{card.featured ? 'Premium Support' : 'Self-Guided'}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{card.name}</h3>
            <p className="text-slate-600 mt-2">{card.subtitle}</p>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            {card.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{card.price}</p>
            <a
              href={card.href}
              className={`w-full inline-flex justify-center items-center rounded-2xl px-4 py-3 font-semibold transition ${
                card.featured
                  ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/30 shadow-lg'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {card.cta}
            </a>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default SolutionCardsSection;
