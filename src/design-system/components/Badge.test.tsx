import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/design-system/components/Badge';

/**
 * Component tests for Badge wrapper.
 * Validates: Requirements 7.1–7.4
 */

describe('Badge', () => {
  describe('variant classes', () => {
    it('renders with default variant classes', () => {
      render(<Badge>Status</Badge>);
      const badge = screen.getByText('Status');
      expect(badge.className).toContain('bg-secondary/30');
      expect(badge.className).toContain('text-text-muted');
    });

    it('renders with success variant classes', () => {
      render(<Badge variant="success">Active</Badge>);
      const badge = screen.getByText('Active');
      expect(badge.className).toContain('bg-success-muted');
      expect(badge.className).toContain('text-success');
    });

    it('renders with warning variant classes', () => {
      render(<Badge variant="warning">Pending</Badge>);
      const badge = screen.getByText('Pending');
      expect(badge.className).toContain('bg-warning-muted');
      expect(badge.className).toContain('text-warning');
    });

    it('renders with destructive variant classes', () => {
      render(<Badge variant="destructive">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge.className).toContain('bg-destructive-muted');
      expect(badge.className).toContain('text-destructive');
    });

    it('renders with outline variant classes', () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge.className).toContain('border');
      expect(badge.className).toContain('border-secondary');
      expect(badge.className).toContain('text-text-muted');
    });
  });

  describe('size classes', () => {
    it('renders with sm size classes', () => {
      render(<Badge size="sm">Small</Badge>);
      const badge = screen.getByText('Small');
      expect(badge.className).toContain('px-2');
      expect(badge.className).toContain('text-xs');
    });

    it('renders with md size classes', () => {
      render(<Badge size="md">Medium</Badge>);
      const badge = screen.getByText('Medium');
      expect(badge.className).toContain('px-2.5');
      expect(badge.className).toContain('text-sm');
    });
  });

  describe('defaults', () => {
    it('defaults to variant="default" and size="md"', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      // default variant
      expect(badge.className).toContain('bg-secondary/30');
      expect(badge.className).toContain('text-text-muted');
      // md size
      expect(badge.className).toContain('px-2.5');
      expect(badge.className).toContain('text-sm');
    });
  });

  describe('children rendering', () => {
    it('renders children text', () => {
      render(<Badge>Hello World</Badge>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<Badge className="my-custom-class">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge.className).toContain('my-custom-class');
    });
  });
});
