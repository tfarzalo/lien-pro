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

const LienProfessorLanding: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <HeroSection />
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
  );
};

export default LienProfessorLanding;
