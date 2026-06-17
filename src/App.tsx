import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import { DataProvider } from '@/lib/DataContext';
import { AlertProvider } from '@/lib/AlertContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const QuotationListPage = lazy(() => import('@/pages/QuotationListPage'));
const QuotationFormPage = lazy(() => import('@/pages/QuotationFormPage'));
const QuotationDetailPage = lazy(() => import('@/pages/QuotationDetailPage'));
const OrderListPage = lazy(() => import('@/pages/OrderListPage'));
const OrderFormPage = lazy(() => import('@/pages/OrderFormPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));
const InventoryListPage = lazy(() => import('@/pages/InventoryListPage'));
const InventoryDetailPage = lazy(() => import('@/pages/InventoryDetailPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AccessDeniedPage = lazy(() => import('@/pages/AccessDeniedPage'));

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AlertProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="loading">Cargando...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
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
                    <Route path="/inventario/:id" element={<InventoryDetailPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AlertProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
