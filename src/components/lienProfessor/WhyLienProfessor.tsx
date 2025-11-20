import React from 'react';

const features = [
  {
    title: 'Attorney-Drafted Forms',
    description: 'Every lien and payment bond form is drafted by construction lawyers and tailored to your state’s requirements.',
  },
  {
    title: 'State-Specific Law Libraries',
    description: 'Free online summaries explain lien and bond rules for your project state, including deadlines, tips, and examples.',
  },
  {
    title: 'Reusable Kits',
    description: 'Download once, use your kits on multiple projects within the same state and project type.',
  },
  {
    title: 'Guided Next Steps',
    description: 'Not sure what to do? The assessment recommends the right path—DIY, guided help, or full representation.',
  },
  {
    title: 'Deadline Awareness',
    description: 'Understand key notice and filing deadlines so you never lose your lien rights by missing a date.',
  },
  {
    title: 'Built for Contractors, Subs, and Suppliers',
    description: 'Practical language, not legalese, designed around real-world construction projects.',
  },
];

const FeatureIcon: React.FC = () => (
  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/10 text-brand-600">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-600">
      <path
        d="M19 7l-8 10-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

export const WhyLienProfessorSection: React.FC = () => (
  <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="max-w-3xl mx-auto text-center mb-12">
      <p className="text-sm uppercase tracking-[0.2em] text-brand-600 font-semibold">Why The Lien Professor</p>
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4">
        Created by Construction Lawyers, Built for the Construction Industry
      </h2>
      <p className="text-lg text-slate-600 mt-4">
        The Lien Professor™ combines clear education, reusable attorney-drafted documents, and direct access to construction lawyers so you
        can protect your payment rights with confidence.
      </p>
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm">
          <FeatureIcon />
          <h3 className="text-xl font-semibold text-slate-900 mt-4">{feature.title}</h3>
          <p className="text-sm text-slate-600 mt-2">{feature.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default WhyLienProfessorSection;
