import React from 'react';

const states = [
  { name: 'Texas', description: 'View lien rules for this state' },
  { name: 'Florida', description: 'View lien rules for this state' },
  { name: 'California', description: 'View lien rules for this state' },
];

const CardArrow: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-brand-600">
    <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ResourceLibrarySection: React.FC = () => (
  <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="text-center max-w-3xl mx-auto mb-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Free Law Library</p>
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4">Learn Your Lien Rights Before You Take Action</h2>
      <p className="text-lg text-slate-600 mt-4">
        The Lien Professor™ offers free online summaries of lien and payment bond claim law for each project state, with practice
        pointers, deadlines, and examples to help you plan next steps.
      </p>
    </div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {states.map((state) => (
        <div key={state.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-xl font-semibold text-slate-900">{state.name}</p>
            <CardArrow />
          </div>
          <p className="text-sm text-slate-500 mt-2 flex-1">{state.description}</p>
          <span className="text-sm font-semibold text-brand-700 mt-4 inline-flex items-center">
            View summary
            <CardArrow />
          </span>
        </div>
      ))}
    </div>
    <div className="text-center mt-10">
      <a
        href="/learn"
        className="inline-flex items-center px-6 py-3 rounded-xl border border-brand-500 text-brand-600 font-semibold hover:bg-brand-50 transition"
      >
        Browse All States
      </a>
    </div>
  </section>
);

export default ResourceLibrarySection;
