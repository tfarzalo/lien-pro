import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    title: 'Attorney-Drafted Forms',
    description:
      'Every lien and payment bond form is drafted by Texas construction lawyers and tailored to state requirements.',
  },
  {
    title: 'Texas-Specific Law Library',
    description:
      'Free online summaries explain Texas lien and bond rules, including deadlines, tips, and examples.',
  },
  {
    title: 'Reusable Kits',
    description:
      'Download once, use your kits on multiple Texas projects within the same project type.',
  },
  {
    title: 'Guided Next Steps',
    description:
      'Not sure what to do? The assessment recommends the right path—DIY, guided help, or full representation.',
  },
  {
    title: 'Deadline Awareness',
    description:
      'Understand key notice and filing deadlines so you never lose your lien rights by missing a date.',
  },
  {
    title: 'Built for Contractors, Subs, and Suppliers',
    description:
      'Practical language, not legalese, designed around real-world construction projects.',
  },
];

const FeatureIcon: React.FC = () => (
  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/10 text-brand-600">
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="text-brand-600"
    >
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

export const WhyLienProfessorSection: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="max-w-screen-2xl mx-auto px-6 py-6"
    >
      <div
        className={`max-w-3xl mx-auto text-center mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
      >
        <p className="text-sm uppercase tracking-[0.2em] text-brand-600 font-semibold">
          Why The Lien Professor
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mt-4 leading-tight">
          Created by Construction Lawyers, Built for the Construction&nbsp;Industry
        </h2>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
          The Lien Professor™ combines clear education, reusable attorney-drafted
          documents, and direct access to construction lawyers so you can protect
          your payment rights with&nbsp;confidence.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-6 lg:p-8 shadow-sm hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-700 hover:-translate-y-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
              <FeatureIcon />
            </div>
            <h3 className="text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white mb-3 leading-tight">
              {feature.title}
            </h3>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyLienProfessorSection;
