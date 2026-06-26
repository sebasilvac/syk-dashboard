import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { Tabs, type TabDefinition } from '@/design-system/components/Tabs';

/**
 * Component tests for Tabs wrapper.
 * Validates: Requirements 8.1–8.5, Properties 3, 4
 */

const sampleTabs: TabDefinition[] = [
  { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
  { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
  { value: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
];

describe('Tabs', () => {
  describe('trigger rendering', () => {
    it('renders correct number of tab triggers', () => {
      render(<Tabs tabs={sampleTabs} defaultValue="tab1" />);
      const triggers = screen.getAllByRole('tab');
      expect(triggers).toHaveLength(3);
    });

    it('renders trigger labels', () => {
      render(<Tabs tabs={sampleTabs} defaultValue="tab1" />);
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });
  });

  describe('controlled mode', () => {
    it('works with value + onValueChange', () => {
      const handleChange = vi.fn();
      render(<Tabs tabs={sampleTabs} value="tab1" onValueChange={handleChange} />);

      const tab2Trigger = screen.getByText('Tab 2');
      fireEvent.click(tab2Trigger);
      expect(handleChange).toHaveBeenCalledWith('tab2');
    });

    it('displays content for controlled value', () => {
      render(<Tabs tabs={sampleTabs} value="tab2" />);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('uncontrolled mode', () => {
    it('works with defaultValue', () => {
      render(<Tabs tabs={sampleTabs} defaultValue="tab1" />);
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('switches tabs on click in uncontrolled mode', () => {
      render(<Tabs tabs={sampleTabs} defaultValue="tab1" />);
      const tab2Trigger = screen.getByText('Tab 2');
      fireEvent.click(tab2Trigger);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('moves focus to the next tab on ArrowRight', () => {
      render(<Tabs tabs={sampleTabs} defaultValue="tab1" />);
      const tab1Trigger = screen.getByText('Tab 1');
      fireEvent.keyDown(tab1Trigger, { key: 'ArrowRight' });
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('moves focus to the previous tab on ArrowLeft', () => {
      render(<Tabs tabs={sampleTabs} defaultValue="tab2" />);
      const tab2Trigger = screen.getByText('Tab 2');
      fireEvent.keyDown(tab2Trigger, { key: 'ArrowLeft' });
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('wraps around from last to first on ArrowRight', () => {
      render(<Tabs tabs={sampleTabs} defaultValue="tab3" />);
      const tab3Trigger = screen.getByText('Tab 3');
      fireEvent.keyDown(tab3Trigger, { key: 'ArrowRight' });
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('wraps around from first to last on ArrowLeft', () => {
      render(<Tabs tabs={sampleTabs} defaultValue="tab1" />);
      const tab1Trigger = screen.getByText('Tab 1');
      fireEvent.keyDown(tab1Trigger, { key: 'ArrowLeft' });
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });
  });

  describe('Property 3: Tabs trigger count equals tab definitions length', () => {
    /**
     * **Validates: Requirements 8.2**
     *
     * For any non-empty array of TabDefinition, renders exactly N triggers where N = tabs.length.
     */
    it('renders exactly N triggers for any non-empty tab array', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              value: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
              label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
            }),
            { minLength: 1, maxLength: 10 },
          ).filter((arr) => {
            const values = arr.map((t) => t.value);
            return new Set(values).size === values.length;
          }),
          (tabDefs) => {
            const tabs: TabDefinition[] = tabDefs.map((t) => ({
              ...t,
              content: <span>{t.label} content</span>,
            }));
            const { unmount } = render(<Tabs tabs={tabs} defaultValue={tabs[0]!.value} />);
            const triggers = screen.getAllByRole('tab');
            expect(triggers).toHaveLength(tabs.length);
            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 4: Tabs ARIA linkage correctness', () => {
    /**
     * **Validates: Requirements 8.4**
     *
     * Each trigger's aria-controls matches its panel's id, and each panel's
     * aria-labelledby matches its trigger's id.
     */
    it('aria-controls on triggers matches panel ids, and aria-labelledby on panels matches trigger ids', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              value: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
              label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
            }),
            { minLength: 1, maxLength: 8 },
          ).filter((arr) => {
            const values = arr.map((t) => t.value);
            return new Set(values).size === values.length;
          }),
          (tabDefs) => {
            const tabs: TabDefinition[] = tabDefs.map((t) => ({
              ...t,
              content: <span>{t.label} content</span>,
            }));
            const { container, unmount } = render(<Tabs tabs={tabs} defaultValue={tabs[0]!.value} />);

            const triggers = container.querySelectorAll('[role="tab"]');
            const panels = container.querySelectorAll('[role="tabpanel"]');

            expect(triggers.length).toBe(tabs.length);
            expect(panels.length).toBe(tabs.length);

            triggers.forEach((trigger) => {
              const ariaControls = trigger.getAttribute('aria-controls');
              expect(ariaControls).not.toBeNull();
              const matchingPanel = container.querySelector(`#${CSS.escape(ariaControls!)}`);
              expect(matchingPanel).not.toBeNull();
              expect(matchingPanel!.getAttribute('aria-labelledby')).toBe(trigger.id);
            });

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
