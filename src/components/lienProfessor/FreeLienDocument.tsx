import React from 'react';

export const FreeLienDocumentSection: React.FC = () => (
  <section className="py-16">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl bg-white shadow-xl shadow-brand-200/40 border border-brand-100 p-8 md:p-12">
      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="lg:w-1/2 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Free Lien Document</p>
          <h2 className="text-3xl font-bold text-slate-900">Get a Free Lien Document and Deadline Reminders</h2>
          <p className="text-slate-600">
            Download one free lien-related document and receive occasional deadline reminders and practice tips from our construction law team. No obligation, cancel anytime.
          </p>
        </div>
        <form className="lg:w-1/2 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Company Name</label>
            <input
              type="text"
              placeholder="e.g., Lone Star Builders"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Select Document</label>
            <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white">
              <option>Texas Preliminary Notice Sample</option>
              <option>Texas Mechanics Lien Affidavit Template</option>
              <option>Payment Demand Letter</option>
            </select>
          </div>
          <button
            type="button"
            className="md:col-span-2 inline-flex items-center justify-center rounded-2xl bg-brand-600 text-white font-semibold px-4 py-3 hover:bg-brand-500 transition"
          >
            Send My Free Document
          </button>
        </form>
      </div>
    </div>
  </section>
);

export default FreeLienDocumentSection;
