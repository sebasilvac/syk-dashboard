import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/lib/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import type { AuthContextValue } from '@/types/auth';

/**
 * Integration tests for accessibility compliance.
 * Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

const mockAuthValue: AuthContextValue = {
  state: {
    user: { id: '1', name: 'Test User', role: 'admin' },
    isAuthenticated: true,
  },
  login: vi.fn(),
  logout: vi.fn(),
};

function renderSidebar(props: { isOpen?: boolean; onClose?: () => void } = {}) {
  const { isOpen = false, onClose = vi.fn() } = props;
  return render(
    <AuthContext.Provider value={mockAuthValue}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar isOpen={isOpen} onClose={onClose} />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('Sidebar accessibility compliance', () => {
  describe('Navigation items have proper roles (Req 13.4)', () => {
    it('renders a nav element for desktop sidebar navigation', () => {
      const { container } = renderSidebar();
      const navElements = container.querySelectorAll('nav');
      expect(navElements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders navigation links as anchor elements', () => {
      const { container } = renderSidebar();
      const links = container.querySelectorAll('nav a');
      expect(links.length).toBeGreaterThanOrEqual(5);
    });

    it('all NavLink items have href attributes for keyboard activation', () => {
      const { container } = renderSidebar();
      const links = container.querySelectorAll('nav a');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Keyboard navigation with Tab (Req 13.3)', () => {
    it('NavLink items are focusable via Tab (no tabindex=-1)', () => {
      const { container } = renderSidebar();
      const links = container.querySelectorAll('nav a');
      links.forEach((link) => {
        // Links should not have negative tabindex that would remove them from tab order
        const tabIndex = link.getAttribute('tabindex');
        expect(tabIndex === null || Number(tabIndex) >= 0).toBe(true);
      });
    });

    it('collapse/expand button is focusable', () => {
      const { container } = renderSidebar();
      const buttons = container.querySelectorAll('button[aria-label]');
      const collapseBtn = Array.from(buttons).find(
        (btn) =>
          btn.getAttribute('aria-label') === 'Colapsar menú' ||
          btn.getAttribute('aria-label') === 'Expandir menú'
      );
      expect(collapseBtn).toBeDefined();
      const tabIndex = collapseBtn!.getAttribute('tabindex');
      expect(tabIndex === null || Number(tabIndex) >= 0).toBe(true);
    });
  });

  describe('Collapse/expand button aria-label (Req 13.4)', () => {
    it('displays "Colapsar menú" aria-label when sidebar is expanded', () => {
      renderSidebar();
      const btn = screen.getByLabelText('Colapsar menú');
      expect(btn).toBeInTheDocument();
    });

    it('displays "Expandir menú" aria-label after collapsing', () => {
      renderSidebar();
      const collapseBtn = screen.getByLabelText('Colapsar menú');
      fireEvent.click(collapseBtn);
      const expandBtn = screen.getByLabelText('Expandir menú');
      expect(expandBtn).toBeInTheDocument();
    });

    it('toggle button has type="button" to prevent form submission', () => {
      renderSidebar();
      const btn = screen.getByLabelText('Colapsar menú');
      expect(btn).toHaveAttribute('type', 'button');
    });
  });

  describe('ARIA attributes preserved after migration (Req 13.4)', () => {
    it('mobile backdrop has aria-hidden="true"', () => {
      const { container } = renderSidebar({ isOpen: true });
      const backdrop = container.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('mobile close button has aria-label="Cerrar menú"', () => {
      renderSidebar({ isOpen: true });
      const closeBtn = screen.getByLabelText('Cerrar menú');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveAttribute('type', 'button');
    });

    it('all interactive buttons have accessible labels', () => {
      const { container } = renderSidebar({ isOpen: true });
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        // Each button should have an aria-label or visible text content
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasTextContent = (button.textContent ?? '').trim().length > 0;
        expect(hasAriaLabel || hasTextContent).toBe(true);
      });
    });
  });

  describe('Mobile sidebar overlay focus management (Req 13.5)', () => {
    it('mobile drawer renders when isOpen is true', () => {
      const { container } = renderSidebar({ isOpen: true });
      // The mobile overlay aside should be translated in (translate-x-0)
      const mobileAside = container.querySelector(
        'aside.translate-x-0'
      ) as HTMLElement | null;
      // Check that the mobile aside exists and is visible
      expect(mobileAside).not.toBeNull();
    });

    it('mobile close button is accessible and calls onClose', () => {
      const onClose = vi.fn();
      renderSidebar({ isOpen: true, onClose });
      const closeBtn = screen.getByLabelText('Cerrar menú');
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clicking backdrop closes the overlay', () => {
      const onClose = vi.fn();
      const { container } = renderSidebar({ isOpen: true, onClose });
      const backdrop = container.querySelector('[aria-hidden="true"]');
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('mobile nav links call onClose when clicked (returns focus to trigger)', () => {
      const onClose = vi.fn();
      const { container } = renderSidebar({ isOpen: true, onClose });
      // Find the mobile nav (second nav in DOM) links
      const navElements = container.querySelectorAll('nav');
      const mobileNav = navElements[navElements.length - 1];
      const firstLink = mobileNav?.querySelector('a');
      expect(firstLink).not.toBeNull();
      fireEvent.click(firstLink!);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Focus-visible ring defined in design system (Req 13.2)', () => {
    it('Button component includes focus-visible:ring-2 class', () => {
      const { container } = render(<Button>Test</Button>);
      const button = container.querySelector('button')!;
      expect(button.className).toContain('focus-visible:ring-2');
      expect(button.className).toContain('focus-visible:ring-accent');
    });

    it('Button component includes focus-visible ring-offset for visibility', () => {
      const { container } = render(<Button>Check</Button>);
      const button = container.querySelector('button')!;
      expect(button.className).toContain('focus-visible:ring-offset-2');
    });

    it('collapse button inherits focus-visible from globals.css base rule', () => {
      renderSidebar();
      const btn = screen.getByLabelText('Colapsar menú');
      // The button element is a native button, so it benefits from the
      // :focus-visible base rule in globals.css. Verify it's a valid
      // focusable interactive element.
      expect(btn.tagName).toBe('BUTTON');
      expect(btn).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Non-color indicators for state (Req 13.6)', () => {
    it('active nav item uses border-l-4 as a non-color indicator', () => {
      const { container } = renderSidebar();
      const links = container.querySelectorAll('nav a');
      // The active link (dashboard) should have border-l-4 border-accent
      const activeLink = Array.from(links).find(
        (link) => link.className.includes('border-accent')
      );
      expect(activeLink).toBeDefined();
      expect(activeLink!.className).toContain('border-l-4');
    });

    it('inactive nav items also have border-l-4 border-transparent for consistent layout', () => {
      const { container } = renderSidebar();
      const links = container.querySelectorAll('nav a');
      const inactiveLinks = Array.from(links).filter(
        (link) => link.className.includes('border-transparent')
      );
      expect(inactiveLinks.length).toBeGreaterThanOrEqual(1);
      inactiveLinks.forEach((link) => {
        expect(link.className).toContain('border-l-4');
      });
    });
  });
});
