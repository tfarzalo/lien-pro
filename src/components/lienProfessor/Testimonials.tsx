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
  {
    quote:
      'I was able to file my lien correctly the first time. The forms were clear and the instructions were easy to follow.',
    author: 'David Chen',
    role: 'Plumbing Contractor, Chen Plumbing Services',
  },
  {
    quote:
      'This saved me so much time and stress. The deadline calculator alone is worth the price of admission.',
    author: 'Jennifer Martinez',
    role: 'HVAC Contractor, Martinez Climate Control',
  },
  {
    quote:
      'Best investment I made this year. The payment bond claim templates helped me recover $45,000 on a public project.',
    author: 'Robert Williams',
    role: 'Electrical Contractor, Williams Electric',
  },
  {
    quote:
      'Clear, straightforward, and actually helpful. No more paying lawyers to answer basic lien law questions.',
    author: 'Lisa Anderson',
    role: 'Painting Contractor, Anderson Finishes',
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
  <section className="py-12 bg-slate-50 dark:bg-slate-900 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-600 font-semibold">What Contractors Are Saying</p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">Real Help for Real-World Payment Problems</h2>
      </div>
    </div>

    {/* Full-width scrolling testimonials */}
    <div className="relative mt-10">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900 z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-900 z-10 pointer-events-none" />

      {/* Scrolling container */}
      <div className="flex gap-6 animate-scroll-left">
        {/* Duplicate testimonials for seamless loop */}
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <div
            key={`${testimonial.author}-${index}`}
            className="flex-shrink-0 w-[400px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-900/5 dark:shadow-none p-8 flex flex-col gap-4 h-[280px]"
          >
            <StarsRow />
            <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed flex-1 line-clamp-4">"{testimonial.quote}"</p>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{testimonial.author}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
