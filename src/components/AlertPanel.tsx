import { useNavigate } from 'react-router-dom';
import type { Alert } from '@/types/models';
import './AlertPanel.css';

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
    <div className="alert-panel" role="menu" aria-label="Panel de alertas">
      <div className="alert-panel__header">
        <span className="alert-panel__title">Alertas</span>
        <span className="alert-panel__count">{alerts.length}</span>
      </div>
      {alerts.length === 0 ? (
        <p className="alert-panel__empty">Sin alertas activas</p>
      ) : (
        <ul className="alert-panel__list">
          {alerts.map((alert) => (
            <li key={alert.id} className="alert-panel__item">
              <button
                className={`alert-panel__alert alert-panel__alert--${alert.severity}`}
                onClick={() => handleAlertClick(alert)}
                type="button"
              >
                <span className="alert-panel__severity-dot" />
                <span className="alert-panel__message">{alert.message}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
