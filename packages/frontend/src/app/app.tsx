import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { useMemo, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { trpc, trpcClientOptions } from '@/trpc';
import createIDBPersister from '@/utils/idbPersister';

import Layout from './components/shared/layout/layout';
import PageContainer from './components/shared/page-container/page-container';
import Contact from './pages/contact/contact';
import Creation from './pages/gathering-creation/gathering-creation';
import GatheringView from './pages/gathering-view/gathering-view';
import Homepage from './pages/homepage/homepage';
import MyGatherings from './pages/my-gatherings/my-gatherings';
import NotFound from './pages/not-found/not-found';
import Privacy from './pages/privacy/privacy';
import Team from './pages/team/team';

export default function App() {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, gcTime: 600000 } },
    });
    void persistQueryClient({
      queryClient: client,
      persister: createIDBPersister(),
    });
    return client;
  });
  const trpcClient = useMemo(() => trpc.createClient(trpcClientOptions), []);

  const router = createBrowserRouter([
    { path: '*', element: <NotFound /> },
    {
      path: '/',
      element: <Homepage />,
    },
    {
      path: '/create',
      element: (
        <PageContainer>
          <Creation />
        </PageContainer>
      ),
    },
    {
      path: '/gathering/:id',
      element: (
        <PageContainer>
          <GatheringView />
        </PageContainer>
      ),
    },
    {
      path: '/team',
      element: (
        <PageContainer>
          <Team />
        </PageContainer>
      ),
    },
    {
      path: '/contact',
      element: (
        <PageContainer>
          <Contact />
        </PageContainer>
      ),
    },
    {
      path: '/privacy',
      element: (
        <PageContainer>
          <Privacy />
        </PageContainer>
      ),
    },
    {
      path: '/my-gatherings',
      element: (
        <PageContainer>
          <MyGatherings />
        </PageContainer>
      ),
    },
  ]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en">
          <Layout>
            <RouterProvider router={router} />
          </Layout>
        </LocalizationProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
