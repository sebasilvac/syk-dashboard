export const RECONNECT_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1s, then 2s, then 4s
  backoffFactor: 2,
} as const;

export const CHANNEL_TABLES = [
  'clients',
  'products',
  'variants',
  'quotations',
  'quotation_lines',
  'orders',
  'order_lines',
  'deposits',
] as const;

export type RealtimeTable = (typeof CHANNEL_TABLES)[number];

export function getChannelName(table: RealtimeTable): string {
  return `${table}-changes`;
}
