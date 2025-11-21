import React from 'react';
import { HeroSection } from '@/components/lienProfessor/Hero';
import { HowItWorksSection } from '@/components/lienProfessor/HowItWorks';
import { SolutionCardsSection } from '@/components/lienProfessor/Solutions';
import { WhyLienProfessorSection } from '@/components/lienProfessor/WhyLienProfessor';
import { ResourceCategoriesSection } from '@/components/lienProfessor/ResourceCategories';
import { Top5MistakesSection } from '@/components/lienProfessor/Top5Mistakes';
import { FreeLienDocumentSection } from '@/components/lienProfessor/FreeLienDocument';
import { TestimonialsSection } from '@/components/lienProfessor/Testimonials';
import { FAQSection, FinalCTASection } from '@/components/lienProfessor/FAQAndFooter';
import { PopularLienKitsSection } from '@/components/lienProfessor/PopularLienKits';
import { MobileWarning } from '@/components/common/MobileWarning';

const LienProfessorLanding: React.FC = () => {
  return (
    <>
      <MobileWarning />
      <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <HeroSection />
      
      {/* Industry Authority Banner */}
      <div className="bg-white dark:bg-slate-900 py-12 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-brand-600 dark:text-brand-400 tracking-tight leading-none">
            The Industry's LIEN Authority
          </h2>
        </div>
      </div>
      
      <main className="space-y-0">
        {/* How It Works */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HowItWorksSection />
        </div>

        {/* Solution Cards */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SolutionCardsSection />
        </div>

        {/* Top 5 Mistakes - Featured CTA Section */}
        <Top5MistakesSection />

        {/* Why Lien Professor */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WhyLienProfessorSection />
        </div>

        {/* Resource Categories - Private & Government Projects */}
        <ResourceCategoriesSection />

        {/* Popular Lien Kits */}
        <PopularLienKitsSection />

        {/* Free Lien Document */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FreeLienDocumentSection />
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto px-auto px-4 sm:px-6 lg:px-8 py-8">
          <TestimonialsSection />
        </div>

        {/* FAQ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FAQSection />
        </div>

        {/* Final CTA */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FinalCTASection />
        </div>
      </main>
    </div>
    </>
  );
};

export default LienProfessorLanding;
