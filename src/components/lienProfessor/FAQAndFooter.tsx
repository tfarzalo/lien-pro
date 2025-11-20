import React from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'Is The Lien Professor a law firm?',
    answer:
      'The Lien Professor is an educational platform developed with construction lawyers. We connect you with licensed attorneys when you need formal representation.',
  },
  {
    question: 'Do I still need a lawyer if I use a lien kit?',
    answer:
      'Our attorney-drafted kits guide you through filing, but they do not replace a lawyer. Get attorney review or full representation when you want legal advice specific to your project.',
  },
  {
    question: 'Which states do you cover?',
    answer:
      'We currently provide detailed guidance for Texas along with templates for key states. New states are added based on demand—contact us if you need another jurisdiction.',
  },
  {
    question: 'Can I reuse my lien kit on multiple projects?',
    answer: 'Yes, your kit is reusable for projects within the same state and project type. Update dates, amounts, and parties for each job.',
  },
  {
    question: 'How does attorney review work?',
    answer:
      'Submit your completed kit and a construction lawyer will review documents, deadlines, and service steps, then provide recommendations before you send anything.',
  },
];

export const FAQSection: React.FC = () => (
  <section className="py-16 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem]">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-600 font-semibold">Frequently Asked Questions</p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Answers for lien and bond questions</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-6 shadow-sm">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{faq.question}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const FinalCTASection: React.FC = () => (
  <section className="py-16">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 text-white p-10 text-center space-y-4 shadow-xl shadow-brand-700/40">
      <h2 className="text-3xl font-bold">Ready to Protect Your Payment Rights?</h2>
      <p className="text-white/80">
        Take the free assessment to discover what liens you can file on your project.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/assessment"
          className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white text-brand-700 font-semibold shadow hover:bg-slate-100"
        >
          Start Free Assessment
        </Link>
        <Link to="/contact" className="text-white/80 hover:text-white text-sm font-semibold underline underline-offset-4">
          Talk to a Construction Lawyer
        </Link>
      </div>
    </div>
  </section>
);

export const SiteFooter: React.FC = () => (
  <footer className="bg-slate-950 text-slate-200 py-10">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <img src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lien-professor-icon.png" alt="Lien Professor" className="h-12 w-12" />
        <div>
          <p className="text-lg font-semibold">Lien Professor</p>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Lovein | Ribman P.C. All rights reserved.</p>
        </div>
      </div>
      <div className="flex gap-6 text-sm">
        <Link to="/terms" className="text-slate-300 hover:text-white">Terms</Link>
        <Link to="/privacy" className="text-slate-300 hover:text-white">Privacy</Link>
        <Link to="/disclaimers" className="text-slate-300 hover:text-white">Disclaimers</Link>
      </div>
    </div>
  </footer>
);
