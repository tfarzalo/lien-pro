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
    <section className="bg-gradient-to-b from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 pt-16 pb-20 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 md:grid-cols-2 md:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100/80 px-4 py-1 text-sm font-medium text-brand-700">
            Trusted by 1,000+ contractors
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">
              Protect Your Payment Rights with Texas Lien Law
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              The Lien Professor™ gives you the knowledge, step-by-step instructions, and attorney-drafted documents to
              prepare, file, and enforce construction liens and payment bond claims with confidence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/assessment"
              className="inline-flex justify-center items-center px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold shadow-lg shadow-brand-200/60 hover:bg-brand-500 transition-colors"
            >
              Start Free Assessment
            </Link>
            <Link
              to="/kits"
              className="inline-flex justify-center items-center px-6 py-3 rounded-xl border border-brand-300 text-brand-700 font-semibold bg-white hover:bg-brand-50 transition-colors dark:bg-slate-900 dark:text-white dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Browse Lien Kits
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {benefits.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                <item.icon className="h-5 w-5 text-brand-600" />
                <p className="text-sm text-slate-700 leading-snug dark:text-slate-200">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-brand-200/40 blur-3xl rounded-3xl dark:bg-brand-900/40" aria-hidden />
          <div className="relative rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-brand-200/40 p-6 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Overview</p>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Your Lien Dashboard</h3>
              </div>
              <span className="text-xs text-brand-700 bg-brand-100 px-3 py-1 rounded-full font-semibold dark:bg-brand-900/30 dark:text-brand-100">
                Live
              </span>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:bg-slate-900/60 dark:border-slate-800">
                <p className="text-xs uppercase text-slate-500 font-semibold dark:text-slate-400">Project</p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">Main Street Apartments</p>
                <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                  <span>
                    Deadline: <strong className="text-slate-900 dark:text-white">03/15</strong>
                  </span>
                  <span>
                    Status: <strong className="text-brand-700 dark:text-brand-300">Notice Sent</strong>
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 bg-white dark:bg-slate-900/60 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">Next step</p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">File Lien Affidavit</p>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">We’ll remind you 7 days before the deadline.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
