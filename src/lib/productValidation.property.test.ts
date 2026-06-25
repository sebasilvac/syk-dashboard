import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateProductForm } from '@/lib/productValidation';
import type { ProductFormData, VariantFormData } from '@/lib/productValidation';

/**
 * Feature: product-creation, Property 1: Valid product form data produces no validation errors
 *
 * For any product form data where the name is non-empty (has at least one non-whitespace character),
 * the category is non-empty (has at least one non-whitespace character), and there is at least one
 * variant where size is non-empty, color is non-empty, stock >= 0, and minStock >= 0,
 * the `validateProductForm` function SHALL return an empty error array.
 *
 * **Validates: Requirements 7.2**
 */
describe('Feature: product-creation, Property 1: Valid product form data produces no validation errors', () => {
  // Generator: non-empty trimmed string (at least one non-whitespace character)
  const arbNonEmptyString = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0);

  // Generator: non-negative integer for stock values
  const arbNonNegativeInt = fc.nat({ max: 10000 });

  // Generator: a valid variant
  const arbValidVariant: fc.Arbitrary<VariantFormData> = fc.record({
    size: arbNonEmptyString,
    color: arbNonEmptyString,
    stock: arbNonNegativeInt,
    minStock: arbNonNegativeInt,
  });

  // Generator: valid ProductFormData (1+ valid variants)
  const arbValidProductFormData: fc.Arbitrary<ProductFormData> = fc.record({
    name: arbNonEmptyString,
    category: arbNonEmptyString,
    variants: fc.array(arbValidVariant, { minLength: 1, maxLength: 5 }),
  });

  it('returns no validation errors for valid product form data', () => {
    fc.assert(
      fc.property(arbValidProductFormData, (data) => {
        const errors = validateProductForm(data);
        expect(errors).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: product-creation, Property 2: Empty required string fields produce field-specific errors
 *
 * For any product form data where at least one required string field (name, category, variant size,
 * or variant color) is empty or composed entirely of whitespace, the `validateProductForm` function
 * SHALL return at least one error whose `field` identifier references the empty field.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 7.3**
 */
describe('Feature: product-creation, Property 2: Empty required string fields produce field-specific errors', () => {
  // Generator: whitespace-only or empty string
  const arbEmptyOrWhitespace = fc.oneof(
    fc.constant(''),
    fc.nat({ max: 9 }).map((n) => ' '.repeat(n + 1))
  );

  // Generator: non-empty trimmed string (valid field value)
  const arbNonEmptyString = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0);

  // Generator: non-negative integer for stock values
  const arbNonNegativeInt = fc.nat({ max: 10000 });

  // Generator: a valid variant
  const arbValidVariant: fc.Arbitrary<VariantFormData> = fc.record({
    size: arbNonEmptyString,
    color: arbNonEmptyString,
    stock: arbNonNegativeInt,
    minStock: arbNonNegativeInt,
  });

  // Strategy: pick which required string field to make empty, then generate the rest validly
  // Required string fields: name, category, variants[i].size, variants[i].color

  it('returns at least one error referencing the empty field when name is empty/whitespace', () => {
    fc.assert(
      fc.property(
        arbEmptyOrWhitespace,
        arbNonEmptyString,
        fc.array(arbValidVariant, { minLength: 1, maxLength: 5 }),
        (name, category, variants) => {
          const data: ProductFormData = { name, category, variants };
          const errors = validateProductForm(data);
          expect(errors.length).toBeGreaterThanOrEqual(1);
          expect(errors.some((e) => e.field === 'name')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns at least one error referencing the empty field when category is empty/whitespace', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbEmptyOrWhitespace,
        fc.array(arbValidVariant, { minLength: 1, maxLength: 5 }),
        (name, category, variants) => {
          const data: ProductFormData = { name, category, variants };
          const errors = validateProductForm(data);
          expect(errors.length).toBeGreaterThanOrEqual(1);
          expect(errors.some((e) => e.field === 'category')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns at least one error referencing the empty field when a variant size is empty/whitespace', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        fc.array(arbValidVariant, { minLength: 0, maxLength: 3 }),
        arbEmptyOrWhitespace,
        arbNonEmptyString,
        arbNonNegativeInt,
        arbNonNegativeInt,
        (name, category, prefixVariants, emptySize, color, stock, minStock) => {
          const invalidVariant: VariantFormData = { size: emptySize, color, stock, minStock };
          const variants = [...prefixVariants, invalidVariant];
          const data: ProductFormData = { name, category, variants };
          const errors = validateProductForm(data);
          const targetField = `variants[${prefixVariants.length}].size`;
          expect(errors.length).toBeGreaterThanOrEqual(1);
          expect(errors.some((e) => e.field === targetField)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns at least one error referencing the empty field when a variant color is empty/whitespace', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        fc.array(arbValidVariant, { minLength: 0, maxLength: 3 }),
        arbNonEmptyString,
        arbEmptyOrWhitespace,
        arbNonNegativeInt,
        arbNonNegativeInt,
        (name, category, prefixVariants, size, emptyColor, stock, minStock) => {
          const invalidVariant: VariantFormData = { size, color: emptyColor, stock, minStock };
          const variants = [...prefixVariants, invalidVariant];
          const data: ProductFormData = { name, category, variants };
          const errors = validateProductForm(data);
          const targetField = `variants[${prefixVariants.length}].color`;
          expect(errors.length).toBeGreaterThanOrEqual(1);
          expect(errors.some((e) => e.field === targetField)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: product-creation, Property 3: Negative numeric fields produce field-specific errors
 *
 * For any product form data where at least one variant has a stock value < 0 or a minStock value < 0,
 * the `validateProductForm` function SHALL return at least one error whose `field` identifier
 * references the invalid variant field.
 *
 * **Validates: Requirements 3.5, 3.6, 7.3**
 */
describe('Feature: product-creation, Property 3: Negative numeric fields produce field-specific errors', () => {
  // Generator: non-empty trimmed string (valid field value)
  const arbNonEmptyString = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0);

  // Generator: non-negative integer for valid stock values
  const arbNonNegativeInt = fc.nat({ max: 10000 });

  // Generator: strictly negative integer
  const arbNegativeInt = fc.integer({ min: -10000, max: -1 });

  // Generator: a valid variant
  const arbValidVariant: fc.Arbitrary<VariantFormData> = fc.record({
    size: arbNonEmptyString,
    color: arbNonEmptyString,
    stock: arbNonNegativeInt,
    minStock: arbNonNegativeInt,
  });

  it('returns at least one error referencing the variant stock field when stock is negative', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        fc.array(arbValidVariant, { minLength: 0, maxLength: 3 }),
        arbNonEmptyString,
        arbNonEmptyString,
        arbNegativeInt,
        arbNonNegativeInt,
        (name, category, prefixVariants, size, color, negativeStock, minStock) => {
          const invalidVariant: VariantFormData = { size, color, stock: negativeStock, minStock };
          const variants = [...prefixVariants, invalidVariant];
          const data: ProductFormData = { name, category, variants };
          const errors = validateProductForm(data);
          const targetField = `variants[${prefixVariants.length}].stock`;
          expect(errors.length).toBeGreaterThanOrEqual(1);
          expect(errors.some((e) => e.field === targetField)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns at least one error referencing the variant minStock field when minStock is negative', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        fc.array(arbValidVariant, { minLength: 0, maxLength: 3 }),
        arbNonEmptyString,
        arbNonEmptyString,
        arbNonNegativeInt,
        arbNegativeInt,
        (name, category, prefixVariants, size, color, stock, negativeMinStock) => {
          const invalidVariant: VariantFormData = { size, color, stock, minStock: negativeMinStock };
          const variants = [...prefixVariants, invalidVariant];
          const data: ProductFormData = { name, category, variants };
          const errors = validateProductForm(data);
          const targetField = `variants[${prefixVariants.length}].minStock`;
          expect(errors.length).toBeGreaterThanOrEqual(1);
          expect(errors.some((e) => e.field === targetField)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns errors for both stock and minStock when both are negative in the same variant', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        fc.array(arbValidVariant, { minLength: 0, maxLength: 3 }),
        arbNonEmptyString,
        arbNonEmptyString,
        arbNegativeInt,
        arbNegativeInt,
        (name, category, prefixVariants, size, color, negativeStock, negativeMinStock) => {
          const invalidVariant: VariantFormData = { size, color, stock: negativeStock, minStock: negativeMinStock };
          const variants = [...prefixVariants, invalidVariant];
          const data: ProductFormData = { name, category, variants };
          const errors = validateProductForm(data);
          const stockField = `variants[${prefixVariants.length}].stock`;
          const minStockField = `variants[${prefixVariants.length}].minStock`;
          expect(errors.length).toBeGreaterThanOrEqual(2);
          expect(errors.some((e) => e.field === stockField)).toBe(true);
          expect(errors.some((e) => e.field === minStockField)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: product-creation, Property 4: Validation error count is monotonic with violations
 *
 * For any product form data, the number of errors returned by `validateProductForm` SHALL be
 * greater than or equal to the number of distinct field violations present in the input
 * (each empty required field and each negative numeric field counts as one violation).
 *
 * **Validates: Requirements 7.3**
 */
describe('Feature: product-creation, Property 4: Validation error count is monotonic with violations', () => {
  // Generator: arbitrary string (may be empty, whitespace-only, or non-empty)
  const arbAnyString = fc.oneof(
    fc.constant(''),
    fc.nat({ max: 5 }).map((n) => ' '.repeat(n)),
    fc.string({ minLength: 0, maxLength: 30 })
  );

  // Generator: arbitrary integer that may be negative or non-negative
  const arbAnyInt = fc.integer({ min: -1000, max: 1000 });

  // Generator: arbitrary variant with potentially invalid values
  const arbAnyVariant: fc.Arbitrary<VariantFormData> = fc.record({
    size: arbAnyString,
    color: arbAnyString,
    stock: arbAnyInt,
    minStock: arbAnyInt,
  });

  // Generator: arbitrary ProductFormData (may have zero or more variants)
  const arbAnyProductFormData: fc.Arbitrary<ProductFormData> = fc.record({
    name: arbAnyString,
    category: arbAnyString,
    variants: fc.array(arbAnyVariant, { minLength: 1, maxLength: 5 }),
  });

  /**
   * Counts the number of distinct violations in the input:
   * - empty/whitespace name: 1
   * - empty/whitespace category: 1
   * - for each variant: empty/whitespace size (1), empty/whitespace color (1), stock < 0 (1), minStock < 0 (1)
   */
  function countViolations(data: ProductFormData): number {
    let count = 0;

    if (!data.name || data.name.trim() === '') {
      count++;
    }

    if (!data.category || data.category.trim() === '') {
      count++;
    }

    for (const variant of data.variants) {
      if (!variant.size || variant.size.trim() === '') {
        count++;
      }
      if (!variant.color || variant.color.trim() === '') {
        count++;
      }
      if (variant.stock < 0) {
        count++;
      }
      if (variant.minStock < 0) {
        count++;
      }
    }

    return count;
  }

  it('error array length is >= the number of distinct violations in the input', () => {
    fc.assert(
      fc.property(arbAnyProductFormData, (data) => {
        const errors = validateProductForm(data);
        const violations = countViolations(data);
        expect(errors.length).toBeGreaterThanOrEqual(violations);
      }),
      { numRuns: 100 }
    );
  });
});
