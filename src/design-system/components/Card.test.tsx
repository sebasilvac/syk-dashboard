import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '@/design-system/components/Card';

/**
 * Component tests for Card wrapper.
 * Validates: Requirements 5.1–5.5
 */

describe('Card', () => {
  describe('title rendering', () => {
    it('renders title when provided', () => {
      render(<Card title="Card Title">Content</Card>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders title in a heading element', () => {
      render(<Card title="Card Title">Content</Card>);
      expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument();
    });
  });

  describe('description rendering', () => {
    it('renders description when provided', () => {
      render(<Card title="Title" description="A description">Content</Card>);
      expect(screen.getByText('A description')).toBeInTheDocument();
    });
  });

  describe('footer rendering', () => {
    it('renders footer when provided', () => {
      render(<Card footer={<button>Save</button>}>Content</Card>);
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('does not render footer section when no footer', () => {
      const { container } = render(<Card>Content</Card>);
      const footerEl = container.querySelector('.border-t');
      expect(footerEl).toBeNull();
    });
  });

  describe('header section', () => {
    it('does not render header section when no title or description', () => {
      const { container } = render(<Card>Content</Card>);
      // Header section has pb-0 class
      const headerEl = container.querySelector('.pb-0');
      expect(headerEl).toBeNull();
    });
  });

  describe('variant classes', () => {
    it('applies default variant classes by default', () => {
      const { container } = render(<Card>Content</Card>);
      const cardEl = container.firstElementChild!;
      expect(cardEl.className).toContain('bg-surface');
      expect(cardEl.className).toContain('shadow-soft');
    });

    it('applies elevated variant classes', () => {
      const { container } = render(<Card variant="elevated">Content</Card>);
      const cardEl = container.firstElementChild!;
      expect(cardEl.className).toContain('shadow-elevated');
    });

    it('applies outlined variant classes', () => {
      const { container } = render(<Card variant="outlined">Content</Card>);
      const cardEl = container.firstElementChild!;
      expect(cardEl.className).toContain('border');
      expect(cardEl.className).toContain('border-secondary/30');
    });
  });
});
