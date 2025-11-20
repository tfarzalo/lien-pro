import React from 'react';
import { Link } from 'react-router-dom';

type RouteEntry = {
  path: string;
  label: string;
  description?: string;
  dynamic?: boolean;
};

type RouteSection = {
  title: string;
  routes: RouteEntry[];
};

const sections: RouteSection[] = [
  {
    title: 'Public Pages',
    routes: [
      { path: '/', label: 'Application Site Map', description: 'Quick links to every available page.' },
      { path: '/landing', label: 'Legacy Marketing Landing', description: 'Original public homepage experience.' },
      { path: '/lien-professor', label: 'Lien Professor Landing', description: 'New sales-focused marketing page.' },
      { path: '/assessment', label: 'Interactive Assessment', description: 'Begin the guided lien assessment.' },
      { path: '/kits', label: 'Browse Lien Kits', description: 'Explore lien document kits by state/project.' },
      { path: '/learn', label: 'Learn Center', description: 'Education hub with lien law articles.' },
      { path: '/learn/what-is-a-lien', label: 'What Is a Lien?', description: 'Breakdown of the basics.' },
      { path: '/learn/who-can-file', label: 'Who Can File', description: 'Eligibility overview for lien filings.' },
      { path: '/learn/preliminary-notice', label: 'Preliminary Notice Guide', description: 'Process and best practices.' },
      { path: '/learn/residential-vs-commercial', label: 'Residential vs Commercial', description: 'Key differences to know.' },
      { path: '/login', label: 'Sign In / Register', description: 'Authenticate to access dashboards.' },
    ],
  },
  {
    title: 'Customer Portal (Protected)',
    routes: [
      { path: '/dashboard', label: 'Enhanced Dashboard', description: 'Primary logged-in experience.' },
      { path: '/dashboard-old', label: 'Legacy Dashboard', description: 'Older dashboard maintained for reference.' },
      { path: '/checkout', label: 'Checkout', description: 'Purchase lien kits and services.' },
      { path: '/checkout/success', label: 'Order Success', description: 'Displays after completing checkout.' },
      {
        path: '/projects/:projectId/forms/:formId',
        label: 'Project Form Completion',
        description: 'Replace :projectId and :formId with IDs to access a specific workflow.',
        dynamic: true,
      },
    ],
  },
  {
    title: 'Admin Portal (Protected)',
    routes: [
      { path: '/admin', label: 'Admin Dashboard', description: 'High-level admin metrics and actions.' },
      { path: '/admin/submissions', label: 'Admin Submissions', description: 'Review incoming assessments.' },
      {
        path: '/admin/submissions/:submissionId',
        label: 'Submission Detail',
        description: 'Replace :submissionId with a valid ID to inspect a submission.',
        dynamic: true,
      },
      { path: '/admin/deadlines', label: 'Admin Deadlines', description: 'Manage state-specific deadlines.' },
      { path: '/admin/users', label: 'Admin Users', description: 'User management area.' },
    ],
  },
];

const SiteMapPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <header className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-500 font-semibold">Navigation Overview</p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Explore Every Page in The Lien Professor</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Use this temporary site map to jump directly to any public, customer, or admin experience. Protected routes
          still require the proper authentication, but they are included for quick reference.
        </p>
      </header>

      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.title} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Routes currently available inside the application.</p>
            </div>
            <ul className="space-y-4">
              {section.routes.map((route) => (
                <li
                  key={route.path}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{route.label}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{route.description}</p>
                  </div>
                  {route.dynamic ? (
                    <code className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 rounded px-3 py-1">{route.path}</code>
                  ) : (
                    <Link
                      to={route.path}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition"
                    >
                      Visit
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SiteMapPage;
