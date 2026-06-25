import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: '📋' },
  { to: '/pedidos', label: 'Pedidos', icon: '📦' },
  { to: '/inventario', label: 'Inventario', icon: '🏷️' },
  { to: '/clientes', label: 'Clientes', icon: '👥' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'bg-bg-secondary flex flex-col transition-all duration-200 ease-in-out',
          'hidden md:flex min-h-dvh',
          collapsed ? 'w-16' : 'w-64',
        ].join(' ')}
      >
        {/* Brand logo area */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-secondary/30">
          {!collapsed && (
            <span className="font-mono text-xl font-bold text-text-primary tracking-widest">
              SYK
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors duration-150"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 py-4 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'group relative flex items-center gap-3 py-2.5 text-sm font-medium transition-all duration-150',
                  collapsed ? 'px-4 justify-center' : 'px-4',
                  isActive
                    ? 'border-l-4 border-accent bg-accent/10 text-text-primary'
                    : 'border-l-4 border-transparent text-text-muted hover:bg-surface hover:text-text-primary',
                ].join(' ')
              }
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded bg-surface text-text-primary text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-elevated">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout at bottom */}
        {state.user && (
          <div className={[
            'border-t border-secondary/30 py-3 flex flex-col gap-2',
            collapsed ? 'px-2 items-center' : 'px-4',
          ].join(' ')}>
            {collapsed ? (
              <span className="text-base" title={state.user.name}>👤</span>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-text-primary">{state.user.name}</span>
                <span className="text-xs text-text-muted capitalize">{state.user.role}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className={[
                'group relative flex items-center gap-2 rounded-xl text-sm font-medium text-text-muted hover:text-destructive hover:bg-destructive-muted transition-colors duration-150',
                collapsed ? 'p-2 justify-center' : 'px-3 py-2 w-full',
              ].join(' ')}
              aria-label="Cerrar sesión"
            >
              <span className="text-base flex-shrink-0">🚪</span>
              {!collapsed && <span>Cerrar sesión</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded bg-surface text-text-primary text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-elevated">
                  Cerrar sesión
                </span>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* Mobile drawer overlay */}
      <aside
        className={[
          'fixed top-0 left-0 z-50 h-full w-64 bg-bg-secondary flex flex-col transition-transform duration-200 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-secondary/30">
          <span className="font-mono text-xl font-bold text-text-primary tracking-widest">
            SYK
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors duration-150"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Mobile navigation */}
        <nav className="flex flex-col gap-1 py-4 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'border-l-4 border-accent bg-accent/10 text-text-primary'
                    : 'border-l-4 border-transparent text-text-muted hover:bg-surface hover:text-text-primary',
                ].join(' ')
              }
              onClick={onClose}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile user info + logout */}
        {state.user && (
          <div className="border-t border-secondary/30 px-4 py-3 flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-text-primary">{state.user.name}</span>
              <span className="text-xs text-text-muted capitalize">{state.user.role}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-3 py-2 w-full text-sm font-medium text-text-muted hover:text-destructive hover:bg-destructive-muted transition-colors duration-150"
              aria-label="Cerrar sesión"
            >
              <span className="text-base">🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
