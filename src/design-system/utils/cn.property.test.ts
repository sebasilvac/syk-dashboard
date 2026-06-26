import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { cn } from './cn';

// Feature: design-system, Property 10: cn() last-wins conflict resolution
describe('cn() property tests', () => {
  const PBT_CONFIG = { numRuns: 100 };

  // Pairs of conflicting Tailwind utilities (same CSS property)
  const conflictingPairs: [string, string][] = [
    ['px-2', 'px-4'],
    ['py-1', 'py-3'],
    ['m-2', 'm-4'],
    ['text-sm', 'text-lg'],
    ['font-normal', 'font-bold'],
    ['rounded-sm', 'rounded-lg'],
    ['bg-red-500', 'bg-blue-500'],
    ['w-4', 'w-8'],
    ['h-4', 'h-8'],
    ['gap-2', 'gap-4'],
    ['p-2', 'p-4'],
    ['mt-2', 'mt-4'],
    ['mb-2', 'mb-4'],
    ['ml-2', 'ml-4'],
    ['mr-2', 'mr-4'],
  ];

  /**
   * **Validates: Requirements 14.1, 14.2**
   */
  it('Property 10: last-wins conflict resolution', () => {
    const pairArb = fc.constantFrom(...conflictingPairs);

    fc.assert(
      fc.property(pairArb, ([first, last]) => {
        const result = cn(first, last);
        expect(result).toContain(last);
        expect(result).not.toContain(first);
      }),
      PBT_CONFIG,
    );
  });

  /**
   * **Validates: Requirements 14.4**
   */
  it('Property 11: filters falsy values', () => {
    const validClass = fc.constantFrom(
      'px-2', 'py-1', 'text-sm', 'font-bold', 'rounded-lg', 'bg-red-500', 'flex', 'items-center',
    );
    const falsyValue = fc.constantFrom(null, undefined, false, '', 0 as unknown as string);

    fc.assert(
      fc.property(
        fc.array(fc.oneof(validClass, falsyValue), { minLength: 1, maxLength: 10 }),
        (inputs) => {
          const result = cn(...inputs);
          // Result should only contain valid class strings
          const validInputs = inputs.filter(
            (v): v is string => typeof v === 'string' && v.length > 0,
          );
          // Each valid class should either be in the result or have been merged away by conflict resolution
          // At minimum, result should be a valid string (no "null", "undefined", "false" in output)
          expect(result).not.toContain('null');
          expect(result).not.toContain('undefined');
          expect(result).not.toContain('false');
          // If there are no valid inputs, result should be empty
          if (validInputs.length === 0) {
            expect(result).toBe('');
          } else {
            expect(result.length).toBeGreaterThan(0);
          }
        },
      ),
      PBT_CONFIG,
    );
  });
});
