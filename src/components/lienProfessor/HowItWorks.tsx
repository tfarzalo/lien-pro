import React from 'react';

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
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">How It Works</p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-4">
          Understand and Secure Your Lien Rights in 3 Steps
        </h2>
        <p className="text-lg text-slate-600">
          The Lien Professor™ turns complex lien law into a simple, guided process for contractors, subcontractors, and
          suppliers.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col gap-4 transition transform hover:-translate-y-1 hover:shadow-lg"
          >
            <StepIcon />
            <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{step.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
