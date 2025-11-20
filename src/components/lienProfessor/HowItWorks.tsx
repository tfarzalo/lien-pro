import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const steps = [
  {
    title: 'Step 1 – Take the Assessment',
    copy: 'Answer a few questions about your project, role, and payment issues. We’ll quickly map your situation to the right lien and payment bond rules for your state.',
  },
  {
    title: 'Step 2 – Get Your Results',
    copy: 'See a clear summary of your lien rights, upcoming deadlines, and the recommended path: DIY lien kit, guided help, or full attorney representation.',
  },
  {
    title: 'Step 3 – Choose Your Path',
    copy: 'Download an attorney-drafted lien kit, request an attorney review, or retain a construction lawyer to handle everything from notices to filing and service.',
  },
];

const StepIcon: React.FC = () => (
  <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shadow-inner shadow-white">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-600">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const HowItWorksSection: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="max-w-screen-2xl mx-auto px-6 py-8">
      <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">How It Works</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-4 mb-4 leading-tight">
          Understand and Secure Your Lien Rights in 3&nbsp;Easy&nbsp;Steps
        </h2>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
          The Lien Professor™ turns complex lien law into a simple, guided process for contractors, subcontractors, and&nbsp;suppliers.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 lg:p-8 flex flex-col gap-4 transition-all duration-700 hover:shadow-xl hover:-translate-y-2 hover:border-brand-300 dark:hover:border-brand-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className="flex items-center gap-4">
              <StepIcon />
              <span className="text-4xl font-bold text-brand-600/20 dark:text-brand-400/20">0{index + 1}</span>
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white leading-tight">{step.title}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">{step.copy}</p>
            <div className="mt-auto pt-4">
              <div className="h-1 w-12 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full group-hover:w-full transition-all duration-500"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
