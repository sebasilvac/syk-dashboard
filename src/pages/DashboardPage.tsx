import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataScope } from '@/hooks/useDataScope';
import { useAlerts } from '@/lib/AlertContext';
import { MetricCard } from '@/components/MetricCard';
import './DashboardPage.css';

export default function DashboardPage() {
  const data = useDataScope();
  const { alerts } = useAlerts();
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const cotizacionesPendientes = data.quotations.filter(
      (q) => q.status === 'pendiente'
    ).length;

    const pedidosActivos = data.orders.filter(
      (o) => o.status === 'activo'
    ).length;

    const productosStockBajo = data.products.filter((p) =>
      p.variants.some((v) => v.stock <= v.minStock)
    ).length;

    return { cotizacionesPendientes, pedidosActivos, productosStockBajo };
  }, [data]);

  function handleAlertClick(resourceType: string, resourceId: string) {
    if (resourceType === 'order') {
      navigate(`/pedidos/${resourceId}`);
    } else if (resourceType === 'product') {
      navigate(`/inventario/${resourceId}`);
    }
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>

      <section className="dashboard__metrics" aria-label="Métricas principales">
        <MetricCard
          title="Cotizaciones Pendientes"
          value={metrics.cotizacionesPendientes}
          variant="default"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          }
        />
        <MetricCard
          title="Pedidos Activos"
          value={metrics.pedidosActivos}
          variant="accent"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          }
        />
        <MetricCard
          title="Productos Stock Bajo"
          value={metrics.productosStockBajo}
          variant="warning"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </section>

      <section className="dashboard__alerts" aria-label="Alertas activas">
        <h2 className="dashboard__alerts-title">Alertas Activas</h2>

        {alerts.length === 0 ? (
          <p className="dashboard__empty">Sin alertas activas</p>
        ) : (
          <div className="dashboard__alert-list" role="list">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                className="dashboard__alert-item"
                role="listitem"
                onClick={() => handleAlertClick(alert.resourceType, alert.resourceId)}
              >
                <span
                  className={`dashboard__alert-severity dashboard__alert-severity--${alert.severity}`}
                  aria-label={alert.severity === 'critical' ? 'Crítica' : 'Advertencia'}
                />
                <span className="dashboard__alert-message">{alert.message}</span>
                <span className="dashboard__alert-arrow" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
