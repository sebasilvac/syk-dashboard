import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthProviderFacade';
import { DataProvider } from '@/lib/DataProvider';
import { AlertProvider } from '@/lib/AlertContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const QuotationListPage = lazy(() => import('@/pages/QuotationListPage'));
const QuotationFormPage = lazy(() => import('@/pages/QuotationFormPage'));
const QuotationDetailPage = lazy(() => import('@/pages/QuotationDetailPage'));
const OrderListPage = lazy(() => import('@/pages/OrderListPage'));
const OrderFormPage = lazy(() => import('@/pages/OrderFormPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));
const InventoryListPage = lazy(() => import('@/pages/InventoryListPage'));
const ProductFormPage = lazy(() => import('@/pages/ProductFormPage'));
const InventoryDetailPage = lazy(() => import('@/pages/InventoryDetailPage'));
const ClientListPage = lazy(() => import('@/pages/ClientListPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AccessDeniedPage = lazy(() => import('@/pages/AccessDeniedPage'));

function RootRedirect() {
  const { state } = useAuth();

  if (state.loading) {
    return <div className="min-h-dvh flex items-center justify-center text-text-muted">Cargando...</div>;
  }

  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AlertProvider>
            <BrowserRouter>
            <Suspense fallback={<div className="loading">Cargando...</div>}>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/acceso-denegado" element={<AccessDeniedPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/cotizaciones" element={<QuotationListPage />} />
                    <Route path="/cotizaciones/nueva" element={<QuotationFormPage />} />
                    <Route path="/cotizaciones/:id" element={<QuotationDetailPage />} />
                    <Route path="/pedidos" element={<OrderListPage />} />
                    <Route path="/pedidos/nuevo" element={<OrderFormPage />} />
                    <Route path="/pedidos/:id" element={<OrderDetailPage />} />
                    <Route path="/inventario" element={<InventoryListPage />} />
                    <Route path="/inventario/nuevo" element={<ProductFormPage />} />
                    <Route path="/inventario/:id" element={<InventoryDetailPage />} />
                    <Route path="/clientes" element={<ClientListPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AlertProvider>
      </DataProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
