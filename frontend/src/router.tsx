import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SearchPage } from '@/pages/SearchPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { CompanyDetailPage } from '@/pages/companies/CompanyDetailPage';
import { PromptGeneratorPage } from '@/pages/companies/PromptGeneratorPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'leads', element: <LeadsPage /> },
      { path: 'leads/:id', element: <CompanyDetailPage /> },
      { path: 'companies/:id', element: <CompanyDetailPage /> },
      { path: 'companies/:id/analysis', element: <CompanyDetailPage /> },
      { path: 'companies/:id/strategy', element: <CompanyDetailPage /> },
      { path: 'companies/:companyId/prompts', element: <PromptGeneratorPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
