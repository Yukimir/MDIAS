import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProjectListPage } from '../pages/ProjectListPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { CreateProjectPage } from '../pages/CreateProjectPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { StagingAreaPage } from '../pages/StagingAreaPage';
import { FileDetailPage } from '../pages/FileDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/projects" replace />,
      },
      {
        path: 'projects',
        children: [
          {
            index: true,
            element: <ProjectListPage />,
          },
          {
            path: 'new',
            element: <CreateProjectPage />,
          },
          {
            path: ':id',
            element: <ProjectDetailPage />,
          },
          {
            path: ':id/staging',
            element: <StagingAreaPage />,
          },
        ],
      },
      {
        path: 'files/:id',
        element: <FileDetailPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },

    ],
  },
]); 