import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/design-system/components/Modal';

/**
 * Component tests for Modal wrapper.
 * Validates: Requirements 6.1–6.7
 */

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'Modal Title',
    children: <p>Modal content</p>,
  };

  describe('ARIA attributes', () => {
    it('renders with aria-modal="true"', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('renders with role="dialog"', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('open state', () => {
    it('does not render when open=false', () => {
      render(<Modal {...defaultProps} open={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders content when open=true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });
  });

  describe('onClose behavior', () => {
    it('calls onClose when Escape is pressed', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked', () => {
      const onClose = vi.fn();
      const { container } = render(<Modal {...defaultProps} onClose={onClose} />);
      // The overlay is the outermost fixed div
      const overlay = container.querySelector('.fixed.inset-0')!;
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when content is clicked', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByText('Modal content'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('title and description', () => {
    it('renders title', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(<Modal {...defaultProps} description="Modal description" />);
      expect(screen.getByText('Modal description')).toBeInTheDocument();
    });
  });

  describe('footer', () => {
    it('renders footer when provided', () => {
      render(<Modal {...defaultProps} footer={<button>Confirm</button>} />);
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('does not render footer section when no footer', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      // Footer has border-t class
      const footerEl = dialog.querySelector('.border-t');
      expect(footerEl).toBeNull();
    });
  });
});
