import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { ImportPage } from '../pages/ImportPage';
import { NSDetailPage } from '../pages/NSDetailPage';
import { ReportsPage } from '../pages/ReportsPage';
import { PatOficinaPage } from '../pages/PatOficinaPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'importar', element: <ImportPage /> },
      { path: 'ns/:id', element: <NSDetailPage /> },
      { path: 'relatorios', element: <ReportsPage /> },
      { path: 'pat-ofic', element: <PatOficinaPage /> },
    ],
  },
]);
