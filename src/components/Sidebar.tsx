import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/cotizaciones', label: 'Cotizaciones' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/inventario', label: 'Inventario' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { state } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <span className="sidebar__brand">SYK</span>
          <button
            className="sidebar__close"
            onClick={onClose}
            aria-label="Cerrar menú"
            type="button"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {state.user && (
          <div className="sidebar__user">
            <span className="sidebar__user-name">{state.user.name}</span>
            <span className="sidebar__user-role">{state.user.role}</span>
          </div>
        )}
      </aside>
    </>
  );
}
