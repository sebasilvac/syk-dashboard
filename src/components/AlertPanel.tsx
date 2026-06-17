import { useNavigate } from 'react-router-dom';
import type { Alert } from '@/types/models';

interface AlertPanelProps {
  alerts: Alert[];
  onClose: () => void;
}

export function AlertPanel({ alerts, onClose }: AlertPanelProps) {
  const navigate = useNavigate();

  function handleAlertClick(alert: Alert) {
    if (alert.resourceType === 'order') {
      navigate(`/pedidos/${alert.resourceId}`);
    } else {
      navigate(`/inventario/${alert.resourceId}`);
    }
    onClose();
  }

  return (
    <div
      className="absolute top-full right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-surface rounded-2xl shadow-elevated border border-secondary/30 z-[200]"
      role="menu"
      aria-label="Panel de alertas"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-secondary/30">
        <span className="text-[0.8125rem] font-bold text-text-primary uppercase tracking-wider">
          Alertas
        </span>
        <span className="text-xs font-semibold text-text-muted">
          {alerts.length}
        </span>
      </div>
      {alerts.length === 0 ? (
        <p className="py-6 px-4 text-center text-[0.8125rem] text-text-muted">
          Sin alertas activas
        </p>
      ) : (
        <ul className="list-none m-0 py-2 px-0">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <button
                className={`flex items-start gap-2 w-full px-4 py-2.5 bg-transparent border-none cursor-pointer text-left transition-colors duration-150 hover:bg-bg-secondary ${
                  alert.severity === 'critical'
                    ? 'border-l-4 border-l-destructive'
                    : alert.severity === 'warning'
                      ? 'border-l-4 border-l-warning'
                      : ''
                }`}
                onClick={() => handleAlertClick(alert)}
                type="button"
              >
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.severity === 'critical'
                      ? 'bg-destructive'
                      : alert.severity === 'warning'
                        ? 'bg-warning'
                        : 'bg-secondary'
                  }`}
                />
                <span className="text-[0.8125rem] leading-relaxed text-text-primary">
                  {alert.message}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
