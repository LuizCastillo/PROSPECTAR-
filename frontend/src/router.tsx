import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewCompanyPage } from '@/pages/NewCompanyPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { CompanyDetailPage } from '@/pages/companies/CompanyDetailPage';
import { PromptGeneratorPage } from '@/pages/companies/PromptGeneratorPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'new-company', element: <NewCompanyPage /> },
          { path: 'leads', element: <LeadsPage /> },
          { path: 'leads/:id', element: <CompanyDetailPage /> },
          { path: 'companies/:id', element: <CompanyDetailPage /> },
          { path: 'companies/:id/analysis', element: <CompanyDetailPage /> },
          { path: 'companies/:id/strategy', element: <CompanyDetailPage /> },
          { path: 'companies/:companyId/prompts', element: <PromptGeneratorPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
