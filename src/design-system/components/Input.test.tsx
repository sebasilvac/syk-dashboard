import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { Input } from '@/design-system/components/Input';

/**
 * Component tests for Input wrapper.
 * Validates: Requirements 4.1–4.5
 */

describe('Input', () => {
  describe('label rendering', () => {
    it('renders label text', () => {
      render(<Input label="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message with role="alert" when error prop is provided', () => {
      render(<Input label="Email" error="Required field" />);
      const errorEl = screen.getByRole('alert');
      expect(errorEl).toBeInTheDocument();
      expect(errorEl).toHaveTextContent('Required field');
    });

    it('links input to error message via aria-describedby', () => {
      render(<Input label="Email" error="Required field" />);
      const input = screen.getByRole('textbox');
      const errorEl = screen.getByRole('alert');
      expect(input).toHaveAttribute('aria-describedby', errorEl.id);
    });

    it('sets aria-invalid="true" on error', () => {
      render(<Input label="Email" error="Required field" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('applies destructive border class on error', () => {
      render(<Input label="Email" error="Required field" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('border-destructive');
    });
  });

  describe('id generation', () => {
    it('auto-generates id from label when no id provided', () => {
      render(<Input label="Full Name" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'field-full-name');
    });

    it('uses explicit id when provided', () => {
      render(<Input label="Full Name" id="custom-id" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });
  });

  describe('Property 2: Input label-to-id association', () => {
    /**
     * **Validates: Requirements 4.4**
     *
     * For any label string, the label's htmlFor matches the input's id.
     */
    it('label htmlFor always matches input id for any label string', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          (label) => {
            const { container, unmount } = render(<Input label={label} />);
            const labelEl = container.querySelector('label');
            const inputEl = container.querySelector('input');
            expect(labelEl).not.toBeNull();
            expect(inputEl).not.toBeNull();
            expect(labelEl!.getAttribute('for')).toBe(inputEl!.getAttribute('id'));
            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('label htmlFor matches input id when explicit id is provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 30 }).filter((s) => /^[a-z][a-z0-9-]*$/.test(s)),
          (label, id) => {
            const { container, unmount } = render(<Input label={label} id={id} />);
            const labelEl = container.querySelector('label');
            const inputEl = container.querySelector('input');
            expect(labelEl).not.toBeNull();
            expect(inputEl).not.toBeNull();
            expect(labelEl!.getAttribute('for')).toBe(inputEl!.getAttribute('id'));
            expect(inputEl!.getAttribute('id')).toBe(id);
            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
