import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { cva } from './cva';

// Feature: design-system, Property 1: Compound variant resolution produces valid classes
describe('cva() property tests', () => {
  const PBT_CONFIG = { numRuns: 100 };

  const testConfig = cva({
    base: 'base-class',
    variants: {
      variant: {
        primary: 'variant-primary',
        secondary: 'variant-secondary',
        destructive: 'variant-destructive',
      },
      size: {
        sm: 'size-sm',
        md: 'size-md',
        lg: 'size-lg',
      },
    },
    compoundVariants: [
      { variant: 'destructive', size: 'lg', class: 'compound-destructive-lg' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  });

  /**
   * **Validates: Requirements 2.3**
   */
  it('Property 1: Compound variant resolution produces valid classes', () => {
    const variantArb = fc.constantFrom('primary', 'secondary', 'destructive') as fc.Arbitrary<'primary' | 'secondary' | 'destructive'>;
    const sizeArb = fc.constantFrom('sm', 'md', 'lg') as fc.Arbitrary<'sm' | 'md' | 'lg'>;

    fc.assert(
      fc.property(variantArb, sizeArb, (variant, size) => {
        const result = testConfig({ variant, size });

        // Result should be a non-empty string
        expect(result.length).toBeGreaterThan(0);

        // Result should always contain the base class
        expect(result).toContain('base-class');

        // Result should contain the selected variant class
        expect(result).toContain(`variant-${variant}`);

        // Result should contain the selected size class
        expect(result).toContain(`size-${size}`);

        // If compound condition matches, compound class should be present
        if (variant === 'destructive' && size === 'lg') {
          expect(result).toContain('compound-destructive-lg');
        }
      }),
      PBT_CONFIG,
    );
  });

  it('uses default variants when no props are provided', () => {
    const result = testConfig();
    expect(result).toContain('base-class');
    expect(result).toContain('variant-primary');
    expect(result).toContain('size-md');
  });

  it('merges consumer className', () => {
    const classNameArb = fc.constantFrom('custom-class', 'extra-spacing', 'my-override');

    fc.assert(
      fc.property(classNameArb, (className) => {
        const result = testConfig({ className });
        expect(result).toContain(className);
        expect(result).toContain('base-class');
      }),
      PBT_CONFIG,
    );
  });
});
