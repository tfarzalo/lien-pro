import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Landmark, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  Bell, 
  FileCheck, 
  Mail, 
  Scale,
  MessageSquare
} from 'lucide-react';

const privateProjectResources = [
  {
    icon: FileText,
    title: 'All Construction Lien Kits and Forms',
    description: 'Complete document packages for Texas construction liens',
    link: '/kits',
    badge: 'Popular',
  },
  {
    icon: BookOpen,
    title: 'How to File a Construction Lien',
    description: 'Step-by-step cheat sheet for filing your lien correctly',
    link: '/learn/how-to-file',
  },
  {
    icon: HelpCircle,
    title: 'Lien Law Questions & Answers',
    description: 'Comprehensive library of Texas lien law information',
    link: '/learn',
  },
  {
    icon: Bell,
    title: 'Serve a Pre-Lien Notice',
    description: 'Protect your rights with proper preliminary notices',
    link: '/kits',
  },
  {
    icon: FileCheck,
    title: 'File a Construction Lien',
    description: 'Complete lien filing package with instructions',
    link: '/kits',
  },
  {
    icon: Mail,
    title: 'Send a Payment Demand Letter',
    description: 'Professional demand letters to get paid faster',
    link: '/kits',
  },
  {
    icon: Scale,
    title: 'File a Lawsuit',
    description: 'Enforcement options when liens aren\'t enough',
    link: '/learn',
  },
  {
    icon: MessageSquare,
    title: 'Ask a Construction Lawyer',
    description: 'Get expert legal advice for your specific situation',
    link: '/assessment',
    badge: 'Free',
  },
];

const governmentProjectResources = [
  {
    icon: FileText,
    title: 'Public Payment Bond Claim Kit',
    description: 'Complete kit for government project bond claims',
    link: '/kits',
  },
  {
    icon: BookOpen,
    title: 'How to Make a Public Payment Bond Claim',
    description: 'Cheat sheet for bond claim filing process',
    link: '/learn',
  },
  {
    icon: HelpCircle,
    title: 'Learn the Payment Bond Claim Laws',
    description: 'Comprehensive bond claim law library',
    link: '/learn',
  },
  {
    icon: Bell,
    title: 'Send a Second Month Notice',
    description: 'Required notices for government projects',
    link: '/kits',
  },
  {
    icon: FileCheck,
    title: 'Make a Payment Bond Claim',
    description: 'Third month notice of claim package',
    link: '/kits',
  },
  {
    icon: Mail,
    title: 'Send a Notice of Claim for Retainage',
    description: 'Protect your retainage on public projects',
    link: '/kits',
  },
  {
    icon: Scale,
    title: 'File a Lawsuit',
    description: 'Legal action for bond claim enforcement',
    link: '/learn',
  },
  {
    icon: MessageSquare,
    title: 'Ask a Payment Bond Claim Question',
    description: 'Expert advice for government projects',
    link: '/assessment',
    badge: 'Free',
  },
];

export const ResourceCategoriesSection: React.FC = () => {
  return (
    <section className="py-16 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-500 font-semibold mb-4">
            Comprehensive Resources
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Tools & Guides by Project Type
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Whether you're working on private construction or government projects, we have the resources you need to protect your payment rights.
          </p>
        </div>

        <div className="space-y-16">
          {/* Private Projects Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Private Projects</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Construction liens for residential & commercial private property</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {privateProjectResources.map((resource, index) => (
                <Link
                  key={index}
                  to={resource.link}
                  className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {resource.badge && (
                    <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-lg">
                      {resource.badge}
                    </div>
                  )}
                  
                  <resource.icon className="h-8 w-8 text-brand-600 dark:text-brand-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm leading-tight">
                    {resource.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {resource.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Government Projects Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg">
                <Landmark className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Government Projects</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Payment bond claims for federal, state, and local government work</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {governmentProjectResources.map((resource, index) => (
                <Link
                  key={index}
                  to={resource.link}
                  className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {resource.badge && (
                    <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-lg">
                      {resource.badge}
                    </div>
                  )}
                  
                  <resource.icon className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm leading-tight">
                    {resource.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {resource.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link
              to="/assessment"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold shadow-lg hover:bg-brand-500 transition-colors"
            >
              Start Free Assessment
            </Link>
            <Link
              to="/learn"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-brand-300 text-brand-700 dark:text-brand-400 dark:border-brand-700 font-semibold hover:bg-brand-50 dark:hover:bg-slate-900 transition-colors"
            >
              Explore Learning Center
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourceCategoriesSection;
