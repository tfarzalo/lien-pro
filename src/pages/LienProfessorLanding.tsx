import React from 'react';
import { HeroSection } from '@/components/lienProfessor/Hero';
import { HowItWorksSection } from '@/components/lienProfessor/HowItWorks';
import { SolutionCardsSection } from '@/components/lienProfessor/Solutions';
import { WhyLienProfessorSection } from '@/components/lienProfessor/WhyLienProfessor';
import { ResourceLibrarySection } from '@/components/lienProfessor/ResourceLibrary';
import { FreeLienDocumentSection } from '@/components/lienProfessor/FreeLienDocument';
import { TestimonialsSection } from '@/components/lienProfessor/Testimonials';
import { FAQSection, FinalCTASection, SiteFooter } from '@/components/lienProfessor/FAQAndFooter';

const sectionSpacing = 'py-16';

const PortalPreviewSection: React.FC = () => (
  <section className={sectionSpacing}>
    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 text-center">Portal Preview</h2>
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
      Dashboard and document workflow preview placeholder.
    </div>
  </section>
);

const LienProfessorLanding: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <HeroSection />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"> 
        <HowItWorksSection />
        <SolutionCardsSection />
        <WhyLienProfessorSection />
        <ResourceLibrarySection />
        <FreeLienDocumentSection />
        <PortalPreviewSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SiteFooter />
      </div>
    </div>
  );
};

export default LienProfessorLanding;
