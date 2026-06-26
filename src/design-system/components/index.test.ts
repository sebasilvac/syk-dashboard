import { describe, it, expect } from 'vitest';
import * as UiExports from '@/design-system/components/index';

/**
 * Barrel export smoke test.
 * Validates: Requirements 11.5
 */
describe('design-system/components barrel export', () => {
  const expectedComponents = [
    'Button',
    'Input',
    'Card',
    'Modal',
    'Badge',
    'Tabs',
    'Table',
    'FormField',
  ];

  it('exports all expected components', () => {
    for (const name of expectedComponents) {
      expect(UiExports).toHaveProperty(name);
      expect(typeof (UiExports as Record<string, unknown>)[name]).toBe('function');
    }
  });

  it('does not export any undefined values', () => {
    for (const [key, value] of Object.entries(UiExports)) {
      expect(value, `Export "${key}" is undefined`).not.toBeUndefined();
    }
  });
});
