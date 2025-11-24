import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { validateConfig, CONFIG } from '@/shared/constants/config';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Layout } from '@/shared/components/layout/Layout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { CustomersPage } from '@/features/customers/pages/CustomersPage';
import { FormsPage } from '@/features/forms/pages/FormsPage';
import { ExcelPage } from '@/features/excel/pages/ExcelPage';
import { Loading } from '@/shared/components/ui';
import './App.css';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isInitialized, isLoading } = useAuth();

  if (!isInitialized || isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading size="lg" text="Loading BYD CRM..." />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// App Routes
function AppRoutes() {
  const { isSignedIn, isInitialized, isLoading } = useAuth();

  useEffect(() => {
    // Validate configuration on mount
    const { valid, errors } = validateConfig();
    if (!valid) {
      console.error('❌ Configuration errors:', errors);
      errors.forEach((error) => console.error(`  - ${error}`));
    } else {
      console.log('✅ Configuration valid');
    }

    // Log app info
    console.log(`🚀 ${CONFIG.APP.NAME} v${CONFIG.APP.VERSION}`);
    console.log(`🌍 Environment: ${CONFIG.APP.ENV}`);
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading size="lg" text="Initializing..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route 
        path="/login" 
        element={isSignedIn ? <Navigate to="/" replace /> : <LoginPage />} 
      />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<CustomersPage />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/excel" element={<ExcelPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/BYD-CRM-REACT">
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
