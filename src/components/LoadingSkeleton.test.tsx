import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

/**
 * Unit tests for LoadingSkeleton component.
 * Validates: Requirements 11.1, 11.2, 11.3
 */

const baseClasses = ['animate-pulse', 'bg-gradient-to-r', 'from-surface', 'to-bg-secondary'];

describe('LoadingSkeleton', () => {
  describe('base animation and gradient classes', () => {
    it('always renders animate-pulse and gradient classes', () => {
      const { container } = render(<LoadingSkeleton variant="card" />);
      const el = container.querySelector('[aria-hidden="true"]')!;
      for (const cls of baseClasses) {
        expect(el.className).toContain(cls);
      }
    });
  });

  describe('variant shape classes', () => {
    it('renders card variant with correct dimensions and rounded-2xl', () => {
      const { container } = render(<LoadingSkeleton variant="card" />);
      const el = container.querySelector('[aria-hidden="true"]')!;
      expect(el.className).toContain('h-24');
      expect(el.className).toContain('w-full');
      expect(el.className).toContain('rounded-2xl');
    });

    it('renders row variant with correct dimensions and rounded-xl', () => {
      const { container } = render(<LoadingSkeleton variant="row" />);
      const el = container.querySelector('[aria-hidden="true"]')!;
      expect(el.className).toContain('h-12');
      expect(el.className).toContain('w-full');
      expect(el.className).toContain('rounded-xl');
    });

    it('renders text variant with correct dimensions and rounded-xl', () => {
      const { container } = render(<LoadingSkeleton variant="text" />);
      const el = container.querySelector('[aria-hidden="true"]')!;
      expect(el.className).toContain('h-4');
      expect(el.className).toContain('w-3/4');
      expect(el.className).toContain('rounded-xl');
    });

    it('renders circle variant with correct dimensions and rounded-full', () => {
      const { container } = render(<LoadingSkeleton variant="circle" />);
      const el = container.querySelector('[aria-hidden="true"]')!;
      expect(el.className).toContain('w-12');
      expect(el.className).toContain('h-12');
      expect(el.className).toContain('rounded-full');
    });
  });

  describe('count prop', () => {
    it('renders 1 element by default', () => {
      const { container } = render(<LoadingSkeleton variant="row" />);
      const elements = container.querySelectorAll('[aria-hidden="true"]');
      expect(elements).toHaveLength(1);
    });

    it('renders multiple elements when count is specified', () => {
      const { container } = render(<LoadingSkeleton variant="row" count={3} />);
      const elements = container.querySelectorAll('[aria-hidden="true"]');
      expect(elements).toHaveLength(3);
    });

    it('renders 5 elements when count is 5', () => {
      const { container } = render(<LoadingSkeleton variant="text" count={5} />);
      const elements = container.querySelectorAll('[aria-hidden="true"]');
      expect(elements).toHaveLength(5);
    });
  });

  describe('className prop', () => {
    it('appends custom className to element classes', () => {
      const { container } = render(
        <LoadingSkeleton variant="card" className="mt-4 custom-class" />
      );
      const el = container.querySelector('[aria-hidden="true"]')!;
      expect(el.className).toContain('mt-4');
      expect(el.className).toContain('custom-class');
    });

    it('preserves base and variant classes when className is appended', () => {
      const { container } = render(
        <LoadingSkeleton variant="card" className="extra" />
      );
      const el = container.querySelector('[aria-hidden="true"]')!;
      expect(el.className).toContain('animate-pulse');
      expect(el.className).toContain('rounded-2xl');
      expect(el.className).toContain('extra');
    });
  });
});
