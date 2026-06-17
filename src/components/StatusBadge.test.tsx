import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/StatusBadge';

/**
 * Unit tests for StatusBadge component.
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 */

const pillClasses = [
  'inline-flex',
  'items-center',
  'rounded-full',
  'px-2.5',
  'py-0.5',
  'text-xs',
  'font-medium',
];

describe('StatusBadge', () => {
  describe('pill shape classes', () => {
    it('always renders the pill shape classes', () => {
      render(<StatusBadge status="active">Active</StatusBadge>);
      const badge = screen.getByText('Active');
      for (const cls of pillClasses) {
        expect(badge.className).toContain(cls);
      }
    });
  });

  describe('status variant color classes', () => {
    it('renders success colors for "active" status', () => {
      render(<StatusBadge status="active">Active</StatusBadge>);
      const badge = screen.getByText('Active');
      expect(badge.className).toContain('bg-success-muted');
      expect(badge.className).toContain('text-success');
    });

    it('renders warning colors for "pending" status', () => {
      render(<StatusBadge status="pending">Pending</StatusBadge>);
      const badge = screen.getByText('Pending');
      expect(badge.className).toContain('bg-warning-muted');
      expect(badge.className).toContain('text-warning');
    });

    it('renders secondary colors for "completed" status', () => {
      render(<StatusBadge status="completed">Completed</StatusBadge>);
      const badge = screen.getByText('Completed');
      expect(badge.className).toContain('bg-secondary/30');
      expect(badge.className).toContain('text-text-muted');
    });

    it('renders destructive colors for "critical" status', () => {
      render(<StatusBadge status="critical">Critical</StatusBadge>);
      const badge = screen.getByText('Critical');
      expect(badge.className).toContain('bg-destructive-muted');
      expect(badge.className).toContain('text-destructive');
    });
  });

  describe('children rendering', () => {
    it('renders children when provided', () => {
      render(<StatusBadge status="active">Custom Label</StatusBadge>);
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('renders status text as fallback when no children provided', () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  describe('legacy Spanish status mapping', () => {
    it('maps "aprobada" to active (success) colors', () => {
      render(<StatusBadge status="aprobada" />);
      const badge = screen.getByText('aprobada');
      expect(badge.className).toContain('bg-success-muted');
      expect(badge.className).toContain('text-success');
    });

    it('maps "activo" to active (success) colors', () => {
      render(<StatusBadge status="activo" />);
      const badge = screen.getByText('activo');
      expect(badge.className).toContain('bg-success-muted');
      expect(badge.className).toContain('text-success');
    });

    it('maps "pendiente" to pending (warning) colors', () => {
      render(<StatusBadge status="pendiente" />);
      const badge = screen.getByText('pendiente');
      expect(badge.className).toContain('bg-warning-muted');
      expect(badge.className).toContain('text-warning');
    });

    it('maps "entregado" to completed (secondary) colors', () => {
      render(<StatusBadge status="entregado" />);
      const badge = screen.getByText('entregado');
      expect(badge.className).toContain('bg-secondary/30');
      expect(badge.className).toContain('text-text-muted');
    });

    it('maps "borrador" to completed (secondary) colors', () => {
      render(<StatusBadge status="borrador" />);
      const badge = screen.getByText('borrador');
      expect(badge.className).toContain('bg-secondary/30');
      expect(badge.className).toContain('text-text-muted');
    });

    it('maps "rechazada" to critical (destructive) colors', () => {
      render(<StatusBadge status="rechazada" />);
      const badge = screen.getByText('rechazada');
      expect(badge.className).toContain('bg-destructive-muted');
      expect(badge.className).toContain('text-destructive');
    });

    it('maps unknown status to completed (secondary) colors as fallback', () => {
      render(<StatusBadge status="unknown-status" />);
      const badge = screen.getByText('unknown-status');
      expect(badge.className).toContain('bg-secondary/30');
      expect(badge.className).toContain('text-text-muted');
    });
  });
});
