import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SupabaseQueryError,
  handleSupabaseError,
  paginationRange,
  deduplicateRequest,
} from './shared';

describe('SupabaseQueryError', () => {
  it('has correct name, message, code, and details', () => {
    const error = new SupabaseQueryError('Something went wrong', '42501', 'permission denied');
    expect(error.name).toBe('SupabaseQueryError');
    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe('42501');
    expect(error.details).toBe('permission denied');
    expect(error).toBeInstanceOf(Error);
  });

  it('handles null code and details', () => {
    const error = new SupabaseQueryError('fail', null, null);
    expect(error.code).toBeNull();
    expect(error.details).toBeNull();
  });
});

describe('handleSupabaseError', () => {
  it('throws SupabaseQueryError with all fields', () => {
    expect(() =>
      handleSupabaseError({ message: 'not found', code: 'PGRST116', details: 'row missing' })
    ).toThrow(SupabaseQueryError);

    try {
      handleSupabaseError({ message: 'not found', code: 'PGRST116', details: 'row missing' });
    } catch (e) {
      const err = e as SupabaseQueryError;
      expect(err.message).toBe('not found');
      expect(err.code).toBe('PGRST116');
      expect(err.details).toBe('row missing');
    }
  });

  it('defaults code and details to null when not provided', () => {
    try {
      handleSupabaseError({ message: 'error' });
    } catch (e) {
      const err = e as SupabaseQueryError;
      expect(err.code).toBeNull();
      expect(err.details).toBeNull();
    }
  });
});

describe('paginationRange', () => {
  it('returns correct range for page 1 with default pageSize', () => {
    const result = paginationRange({});
    expect(result).toEqual({ from: 0, to: 49 });
  });

  it('returns correct range for page 1 with pageSize 50 (defaults)', () => {
    const result = paginationRange({ page: 1, pageSize: 50 });
    expect(result).toEqual({ from: 0, to: 49 });
  });

  it('returns correct range for page 2 with pageSize 10', () => {
    const result = paginationRange({ page: 2, pageSize: 10 });
    expect(result).toEqual({ from: 10, to: 19 });
  });

  it('returns correct range for page 3 with pageSize 25', () => {
    const result = paginationRange({ page: 3, pageSize: 25 });
    expect(result).toEqual({ from: 50, to: 74 });
  });

  it('uses default page=1 when only pageSize is provided', () => {
    const result = paginationRange({ pageSize: 20 });
    expect(result).toEqual({ from: 0, to: 19 });
  });

  it('uses default pageSize=50 when only page is provided', () => {
    const result = paginationRange({ page: 2 });
    expect(result).toEqual({ from: 50, to: 99 });
  });
});

describe('deduplicateRequest', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the same promise for concurrent calls with the same key', async () => {
    const factory = vi.fn().mockResolvedValue('result');

    const promise1 = deduplicateRequest('key1', factory);
    const promise2 = deduplicateRequest('key1', factory);

    expect(promise1).toBe(promise2);
    expect(factory).toHaveBeenCalledTimes(1);

    const [result1, result2] = await Promise.all([promise1, promise2]);
    expect(result1).toBe('result');
    expect(result2).toBe('result');
  });

  it('calls factory again after 100ms deduplication window expires', async () => {
    const factory = vi.fn().mockResolvedValue('result');

    const result1 = await deduplicateRequest('key2', factory);
    expect(result1).toBe('result');

    // Advance past the 100ms deduplication window
    vi.advanceTimersByTime(101);

    const result2 = await deduplicateRequest('key2', factory);
    expect(result2).toBe('result');
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('uses different factory calls for different keys', async () => {
    const factoryA = vi.fn().mockResolvedValue('A');
    const factoryB = vi.fn().mockResolvedValue('B');

    const [resultA, resultB] = await Promise.all([
      deduplicateRequest('keyA', factoryA),
      deduplicateRequest('keyB', factoryB),
    ]);

    expect(resultA).toBe('A');
    expect(resultB).toBe('B');
    expect(factoryA).toHaveBeenCalledTimes(1);
    expect(factoryB).toHaveBeenCalledTimes(1);
  });

  it('propagates errors but still deduplicates', async () => {
    const factory = vi.fn().mockRejectedValue(new Error('network error'));

    const promise1 = deduplicateRequest('key-err', factory);
    const promise2 = deduplicateRequest('key-err', factory);

    expect(promise1).toBe(promise2);
    expect(factory).toHaveBeenCalledTimes(1);

    await expect(promise1).rejects.toThrow('network error');
    await expect(promise2).rejects.toThrow('network error');
  });
});
