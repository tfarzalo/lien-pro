import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { EnhancedDashboardPage } from './pages/EnhancedDashboardPageV2';
import { AssessmentPage } from './pages/AssessmentPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import BrowseKitsPage from './pages/BrowseKitsPage';
import FormCompletionPage from './pages/FormCompletionPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage';
import { SubmissionDetailPage } from './pages/admin/SubmissionDetailPage';
import { AdminDeadlinesPage } from './pages/admin/AdminDeadlinesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { LearnLayout } from './pages/learn/LearnLayout';
import { LearnIndexPage } from './pages/learn/LearnIndexPage';
import { WhatIsALienPage } from './pages/learn/WhatIsALienPage';
import { WhoCanFilePage } from './pages/learn/WhoCanFilePage';
import { PreliminaryNoticePage } from './pages/learn/PreliminaryNoticePage';
import { ResidentialVsCommercialPage } from './pages/learn/ResidentialVsCommercialPage';
import { SiteLayout } from './components/layout/SiteLayout';
import LienProfessorLanding from './pages/LienProfessorLanding';
import SiteMapPage from './pages/SiteMapPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route element={<SiteLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<SiteMapPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/lien-professor" element={<LienProfessorLanding />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/kits" element={<BrowseKitsPage />} />

            {/* Learn/Education Routes */}
            <Route path="/learn" element={<LearnLayout />}>
              <Route index element={<LearnIndexPage />} />
              <Route path="what-is-a-lien" element={<WhatIsALienPage />} />
              <Route path="who-can-file" element={<WhoCanFilePage />} />
              <Route path="preliminary-notice" element={<PreliminaryNoticePage />} />
              <Route path="residential-vs-commercial" element={<ResidentialVsCommercialPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<EnhancedDashboardPage />} />
              <Route path="/dashboard-old" element={<DashboardPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<OrderSuccessPage />} />
              <Route path="/projects/:projectId/forms/:formId" element={<FormCompletionPage />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/*" element={
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="submissions" element={<AdminSubmissionsPage />} />
                  <Route path="submissions/:submissionId" element={<SubmissionDetailPage />} />
                  <Route path="deadlines" element={<AdminDeadlinesPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                </Routes>
              </AdminLayout>
            } />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </ErrorBoundary>
  );
}

export default App;
