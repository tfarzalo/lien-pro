import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Clock, CheckCircle } from 'lucide-react';

const popularKits = [
  {
    id: 1,
    name: 'Texas Mechanic\'s Lien Kit - Private Projects',
    description: 'Complete package for filing mechanic\'s liens on private construction projects in Texas. Includes all required notices, affidavits, and step-by-step filing instructions.',
    price: 149,
    features: [
      'Preliminary Notice Templates',
      'Affidavit of Lien',
      'Deadline Calculator',
      'Service Instructions',
    ],
    icon: FileText,
    popular: true,
  },
  {
    id: 2,
    name: 'Texas Payment Bond Claim Kit',
    description: 'Essential documents for making payment bond claims on public projects. Attorney-drafted templates ensure compliance with Texas Property Code.',
    price: 129,
    features: [
      'Bond Claim Notice',
      'Sworn Statement',
      'Certified Mail Service',
      'Timeline Tracking',
    ],
    icon: Shield,
    popular: true,
  },
  {
    id: 3,
    name: 'Pre-Lien Notice Bundle',
    description: 'Protect your lien rights before work begins. Includes all preliminary notices required for preserving your right to file a lien.',
    price: 79,
    features: [
      'Notice to Owner',
      'Notice to Contractor',
      'Certified Mail Tracking',
      'Deadline Reminders',
    ],
    icon: Clock,
    popular: false,
  },
  {
    id: 4,
    name: 'Lien Release Package',
    description: 'Professional lien release documents for settling payment disputes. Includes conditional and unconditional release forms.',
    price: 49,
    features: [
      'Conditional Waiver',
      'Unconditional Waiver',
      'Partial Release Forms',
      'Full Release Forms',
    ],
    icon: CheckCircle,
    popular: false,
  },
];

export const PopularLienKitsSection: React.FC = () => {
  return (
    <section className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-600 font-semibold">
            Popular Lien Kits
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
            Attorney-Drafted Lien Kits
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Get professional lien documents without the attorney fees. Each kit includes all forms, 
            instructions, and deadlines you need to protect your payment rights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {popularKits.map((kit) => {
            const IconComponent = kit.icon;
            return (
              <div
                key={kit.id}
                className="relative group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10"
              >
                {/* Popular Badge */}
                {kit.popular && (
                  <div className="absolute -top-3 -right-3 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Icon */}
                <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                  <IconComponent className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {kit.name}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                  {kit.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {kit.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${kit.price}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                      one-time
                    </span>
                  </div>
                  <Link
                    to="/browse-kits"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Browse All CTA */}
        <div className="text-center mt-12">
          <Link
            to="/browse-kits"
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Browse All Lien Kits
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
            Or <Link to="/assessment" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold">take the free assessment</Link> to find the right kit for your project
          </p>
        </div>
      </div>
    </section>
  );
};
