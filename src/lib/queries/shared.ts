export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

export class SupabaseQueryError extends Error {
  readonly code: string | null;
  readonly details: string | null;

  constructor(message: string, code: string | null, details: string | null) {
    super(message);
    this.name = 'SupabaseQueryError';
    this.code = code;
    this.details = details;
  }
}

export function handleSupabaseError(error: {
  message: string;
  code?: string;
  details?: string;
}): never {
  throw new SupabaseQueryError(
    error.message,
    error.code ?? null,
    error.details ?? null
  );
}

export function paginationRange(params: PaginationParams): {
  from: number;
  to: number;
} {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

// Cache staleness check (30 seconds threshold)
export function isCacheStale(cachedAt: number, now: number): boolean {
  return now - cachedAt >= 30000;
}

// Request deduplication
const pendingRequests = new Map<string, Promise<unknown>>();

export function deduplicateRequest<T>(
  key: string,
  factory: () => Promise<T>
): Promise<T> {
  const existing = pendingRequests.get(key);
  if (existing) return existing as Promise<T>;

  const promise = factory().finally(() => {
    setTimeout(() => {
      pendingRequests.delete(key);
    }, 100);
  });

  pendingRequests.set(key, promise);
  return promise;
}
