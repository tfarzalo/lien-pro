import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, XCircle, AlertCircle, Clock, FileX, TrendingDown } from 'lucide-react';

const mistakes = [
    {
        icon: Clock,
        title: 'Waiting Because of Promises to Pay',
        description: 'Delaying your lien filing because of repeated promises is one of the costliest mistakes. Start the process immediately to gain leverage.',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
    },
    {
        icon: FileX,
        title: 'Using Free Fill-in-the-Blank Forms',
        description: 'Free internet forms lack proper instructions, state-specific language, and look unprofessional—risking your entire claim.',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
        icon: XCircle,
        title: 'Not Using the Full Lien Filing Process',
        description: 'Filing a simple affidavit isn\'t enough. The process includes what you say, how you say it, and document appearance.',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
        icon: TrendingDown,
        title: 'Using Online Lien Filing Companies',
        description: 'These services use unprofessional forms and aren\'t staffed by lawyers. Don\'t trust them with your legal documents.',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
    {
        icon: AlertCircle,
        title: 'Not Making It a Business Routine',
        description: 'Assume you won\'t be paid and make timely serving of Pre-Lien Notices and filing liens a standard practice in your business.',
        color: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    },
];

export const Top5MistakesSection: React.FC = () => {
    return (
        <section className="py-10 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-950/50 mb-4">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                            Avoid These Critical Errors
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4">
                        The 5 Biggest Construction Lien Filing Mistakes
                    </h2>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Learn what NOT to do when protecting your payment rights. These common mistakes can invalidate your entire claim.
                    </p>
                </div>

                {/* Mistakes Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
                    {mistakes.map((mistake, index) => (
                        <div
                            key={index}
                            className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Number Badge */}
                            <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {index + 1}
                            </div>

                            {/* Icon */}
                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${mistake.bgColor} mb-4 mt-2`}>
                                <mistake.icon className={`h-7 w-7 ${mistake.color}`} />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                {mistake.title}
                            </h3>
                            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                                {mistake.description}
                            </p>
                        </div>
                    ))}

                    {/* CTA Card */}
                    <div className="group relative rounded-2xl border-2 border-dashed border-brand-300 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center items-center text-center">
                        <AlertTriangle className="h-12 w-12 text-brand-600 dark:text-brand-400 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                            Don't Make These Mistakes
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Get professional guidance and attorney-drafted documents
                        </p>
                        <Link
                            to="/kits"
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-500 transition-colors"
                        >
                            Browse Lien Kits
                        </Link>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center">
                    <Link
                        to="/learn"
                        className="inline-flex items-center gap-2 text-brand-700 dark:text-brand-400 font-semibold hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
                    >
                        Learn more about avoiding these mistakes
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Top5MistakesSection;
