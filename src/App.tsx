/**
 * Main App Component - univercel-tech-forge
 * Simple routing with DigitalOcean + Cloudflare infrastructure
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { UniversalRouter } from '@/router/simpleRouter';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <UniversalRouter />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
