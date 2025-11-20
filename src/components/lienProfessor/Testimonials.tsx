import React from 'react';

const testimonials = [
  {
    quote:
      'The assessment tool helped me understand exactly what liens I could file and when. Saved me thousands in attorney fees.',
    author: 'Sarah Johnson',
    role: 'General Contractor, Johnson Construction',
  },
  {
    quote:
      'Finally, a tool that makes lien law understandable. The step-by-step guidance was invaluable.',
    author: 'Mike Rodriguez',
    role: 'Subcontractor, Rodriguez Electric',
  },
];

const StarsRow: React.FC = () => (
  <div className="flex gap-1 text-amber-400">
    {Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-amber-400"
        aria-hidden
      >
        <path d="M10 15.27L15.18 18l-1.45-6.21L18 7.97l-6.3-.54L10 2 8.3 7.43l-6.3.54 4.27 3.82L4.82 18z" />
      </svg>
    ))}
  </div>
);

export const TestimonialsSection: React.FC = () => (
  <section className="py-16 bg-slate-50">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-600 font-semibold">What Contractors Are Saying</p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Real Help for Real-World Payment Problems</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.author}
            className="rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 p-8 flex flex-col gap-4"
          >
            <StarsRow />
            <p className="text-lg text-slate-800 leading-relaxed">“{testimonial.quote}”</p>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-900">{testimonial.author}</p>
              <p className="text-sm text-slate-500">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
