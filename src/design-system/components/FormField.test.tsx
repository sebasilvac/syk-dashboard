import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { FormField } from '@/design-system/components/FormField';

/**
 * Component tests for FormField wrapper.
 * Validates: Requirements 10.1–10.4, Property 7
 */

describe('FormField', () => {
  describe('label rendering', () => {
    it('renders label text', () => {
      render(
        <FormField label="Username">
          <input id="username" />
        </FormField>,
      );
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('renders label as a label element', () => {
      const { container } = render(
        <FormField label="Username" htmlFor="username">
          <input id="username" />
        </FormField>,
      );
      const label = container.querySelector('label');
      expect(label).not.toBeNull();
      expect(label!.textContent).toBe('Username');
    });

    it('associates label with htmlFor', () => {
      const { container } = render(
        <FormField label="Username" htmlFor="username">
          <input id="username" />
        </FormField>,
      );
      const label = container.querySelector('label');
      expect(label).toHaveAttribute('for', 'username');
    });
  });

  describe('error rendering', () => {
    it('renders error with role="alert"', () => {
      render(
        <FormField label="Email" error="Invalid email" htmlFor="email">
          <input id="email" />
        </FormField>,
      );
      const errorEl = screen.getByRole('alert');
      expect(errorEl).toBeInTheDocument();
      expect(errorEl).toHaveTextContent('Invalid email');
    });

    it('error element has deterministic id based on htmlFor', () => {
      render(
        <FormField label="Email" error="Required" htmlFor="email">
          <input id="email" />
        </FormField>,
      );
      const errorEl = screen.getByRole('alert');
      expect(errorEl).toHaveAttribute('id', 'email-error');
    });
  });

  describe('description rendering', () => {
    it('renders description text', () => {
      render(
        <FormField label="Password" description="Must be 8+ characters" htmlFor="password">
          <input id="password" />
        </FormField>,
      );
      expect(screen.getByText('Must be 8+ characters')).toBeInTheDocument();
    });
  });

  describe('aria-describedby linkage', () => {
    it('error element id follows pattern ${htmlFor}-error', () => {
      render(
        <FormField label="Name" error="Required" htmlFor="full-name">
          <input id="full-name" />
        </FormField>,
      );
      const errorEl = screen.getByRole('alert');
      expect(errorEl).toHaveAttribute('id', 'full-name-error');
    });
  });

  describe('Property 7: FormField deterministic aria-describedby linkage', () => {
    /**
     * **Validates: Requirements 10.4**
     *
     * For any htmlFor value and error string, the error element's id follows
     * the pattern `${htmlFor}-error`.
     */
    it('error element id always matches pattern ${htmlFor}-error for any htmlFor and error', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter((s) => /^[a-z][a-z0-9-]*$/.test(s)),
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          (htmlFor, errorMsg) => {
            const { container, unmount } = render(
              <FormField label="Test" error={errorMsg} htmlFor={htmlFor}>
                <input id={htmlFor} />
              </FormField>,
            );
            const errorEl = container.querySelector('[role="alert"]');
            expect(errorEl).not.toBeNull();
            expect(errorEl!.getAttribute('id')).toBe(`${htmlFor}-error`);
            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
