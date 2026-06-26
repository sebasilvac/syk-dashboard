import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/design-system/components/Button';

/**
 * Component tests for Button wrapper.
 * Validates: Requirements 3.1–3.8
 */

describe('Button', () => {
  describe('variant classes', () => {
    it('renders with primary variant classes by default', () => {
      render(<Button>Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn.className).toContain('bg-accent');
      expect(btn.className).toContain('text-white');
    });

    it('renders with secondary variant classes', () => {
      render(<Button variant="secondary">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn.className).toContain('border-secondary');
      expect(btn.className).toContain('text-text-muted');
    });

    it('renders with destructive variant classes', () => {
      render(<Button variant="destructive">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn.className).toContain('bg-destructive');
      expect(btn.className).toContain('text-white');
    });

    it('renders with ghost variant classes', () => {
      render(<Button variant="ghost">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn.className).toContain('bg-transparent');
      expect(btn.className).toContain('text-text-muted');
    });
  });

  describe('loading state', () => {
    it('shows spinner SVG when loading', () => {
      const { container } = render(<Button loading>Click</Button>);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg!.classList.contains('animate-spin')).toBe(true);
    });

    it('sets aria-busy="true" when loading', () => {
      render(<Button loading>Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveAttribute('aria-busy', 'true');
    });

    it('disables the button when loading', () => {
      render(<Button loading>Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toBeDisabled();
    });
  });

  describe('disabled state', () => {
    it('disables the button when disabled prop is true', () => {
      render(<Button disabled>Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toBeDisabled();
    });
  });

  describe('defaults', () => {
    it('defaults to variant="primary" and size="md"', () => {
      render(<Button>Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      // primary classes
      expect(btn.className).toContain('bg-accent');
      // md size classes
      expect(btn.className).toContain('px-4');
      expect(btn.className).toContain('py-2');
      expect(btn.className).toContain('text-base');
    });
  });

  describe('onClick handler', () => {
    it('fires onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole('button', { name: 'Click' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('type prop', () => {
    it('defaults to type="button"', () => {
      render(<Button>Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveAttribute('type', 'button');
    });

    it('passes through type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      const btn = screen.getByRole('button', { name: 'Submit' });
      expect(btn).toHaveAttribute('type', 'submit');
    });

    it('passes through type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      const btn = screen.getByRole('button', { name: 'Reset' });
      expect(btn).toHaveAttribute('type', 'reset');
    });
  });
});
