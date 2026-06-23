import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  SupabaseQueryError,
  handleSupabaseError,
  paginationRange,
  deduplicateRequest,
  isCacheStale,
} from './shared';

/**
 * Feature: supabase-integration, Property 3: Query error handling produces typed errors
 *
 * For any message/code/details, handleSupabaseError produces a SupabaseQueryError
 * with matching fields.
 *
 * **Validates: Requirements 5.2**
 */
describe('Feature: supabase-integration, Property 3: Query error handling produces typed errors', () => {
  it('for any message, code, and details, handleSupabaseError throws a SupabaseQueryError with matching fields', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
        fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
        (message, code, details) => {
          try {
            handleSupabaseError({ message, code, details });
            // Should never reach here since handleSupabaseError always throws
            expect.fail('handleSupabaseError should throw');
          } catch (e) {
            expect(e).toBeInstanceOf(SupabaseQueryError);
            const err = e as SupabaseQueryError;
            expect(err.name).toBe('SupabaseQueryError');
            expect(err.message).toBe(message);
            expect(err.code).toBe(code ?? null);
            expect(err.details).toBe(details ?? null);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: supabase-integration, Property 5: Pagination range calculation
 *
 * For any page >= 1 and pageSize >= 1, paginationRange returns correct from/to values.
 * When page and pageSize are omitted, defaults of page=1 and pageSize=50 are used.
 *
 * **Validates: Requirements 5.5**
 */
describe('Feature: supabase-integration, Property 5: Pagination range calculation', () => {
  it('for any page >= 1 and pageSize >= 1, returns { from: (page-1)*pageSize, to: (page-1)*pageSize + pageSize - 1 }', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.integer({ min: 1, max: 10000 }),
        (page, pageSize) => {
          const result = paginationRange({ page, pageSize });
          const expectedFrom = (page - 1) * pageSize;
          const expectedTo = expectedFrom + pageSize - 1;
          expect(result.from).toBe(expectedFrom);
          expect(result.to).toBe(expectedTo);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when page and pageSize are omitted, uses defaults page=1 and pageSize=50', () => {
    const result = paginationRange({});
    expect(result.from).toBe(0);
    expect(result.to).toBe(49);
  });
});

/**
 * Feature: supabase-integration, Property 8: Request deduplication
 *
 * For concurrent calls with the same key, only one factory call occurs and all
 * callers receive the same resolved value.
 *
 * **Validates: Requirements 6.5, 11.3**
 */
describe('Feature: supabase-integration, Property 8: Request deduplication', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('for any N >= 2 concurrent calls with the same key, factory is called exactly once and all callers receive the same value', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 20 }),
        fc.integer({ min: 1, max: 100000 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (n, keyId, resolvedValue) => {
          const factory = vi.fn().mockResolvedValue(resolvedValue);

          // Use a unique key per iteration to avoid collisions with pending map
          const uniqueKey = `dedup-prop8-${keyId}-${Date.now()}-${Math.random()}`;

          const promises = Array.from({ length: n }, () =>
            deduplicateRequest(uniqueKey, factory)
          );

          const results = await Promise.all(promises);

          // Factory called exactly once
          expect(factory).toHaveBeenCalledTimes(1);

          // All callers receive the same value
          for (const result of results) {
            expect(result).toBe(resolvedValue);
          }

          // Clean up: advance timers to clear the dedup window
          vi.advanceTimersByTime(150);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: supabase-integration, Property 11: Cache staleness decision
 *
 * For any timestamp and current time, isCacheStale returns true if now - cachedAt >= 30000
 * (30 seconds in ms), and false otherwise.
 *
 * **Validates: Requirements 11.4**
 */
describe('Feature: supabase-integration, Property 11: Cache staleness decision', () => {
  it('for any cachedAt and now where now - cachedAt >= 30000, isCacheStale returns true', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        fc.integer({ min: 30000, max: 1_000_000 }),
        (cachedAt, offset) => {
          const now = cachedAt + offset;
          expect(isCacheStale(cachedAt, now)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any cachedAt and now where now - cachedAt < 30000, isCacheStale returns false', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        fc.integer({ min: 0, max: 29999 }),
        (cachedAt, offset) => {
          const now = cachedAt + offset;
          expect(isCacheStale(cachedAt, now)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('boundary: exactly 30000ms difference is stale', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        (cachedAt) => {
          const now = cachedAt + 30000;
          expect(isCacheStale(cachedAt, now)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
