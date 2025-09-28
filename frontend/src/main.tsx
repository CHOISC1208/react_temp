import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/providers';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/routes/router';
import '@/app/styles.css';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
      <Toaster richColors />
    </AppProviders>
  </React.StrictMode>
);
