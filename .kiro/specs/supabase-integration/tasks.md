# Implementation Plan: Supabase Integration

## Overview

Integrate Supabase as the backend for syk-dashboard, replacing in-memory mock data with real PostgreSQL persistence, Supabase Auth, Row Level Security, and real-time subscriptions. The implementation uses a `DataProvider` facade to maintain backward compatibility and enable gradual migration.

## Tasks

- [x] 1. Install Supabase SDK and configure environment
  - [x] 1.1 Install `@supabase/supabase-js` package via pnpm
    - Run `pnpm add @supabase/supabase-js`
    - _Requirements: 1.1_

  - [x] 1.2 Update `.env.example` with Supabase variables
    - Add `VITE_SUPABASE_URL=your-project-url` and `VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key` entries
    - Remove `VITE_API_URL` if present
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 1.3 Create Supabase client singleton at `src/lib/supabase.ts`
    - Initialize with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
    - Throw descriptive error if either variable is missing
    - Configure `persistSession: true` and `autoRefreshToken: true`
    - Log warning if URL doesn't match `https://*.supabase.co` pattern
    - Export as named export `supabase`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.4_

  - [x] 1.4 Add `db:types` script to `package.json`
    - Add script: `"db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.ts"`
    - _Requirements: 8.1, 8.2_

- [x] 2. Create database schema and migrations
  - [x] 2.1 Create schema migration file at `supabase/migrations/001_initial_schema.sql`
    - Define all tables: `clients`, `products`, `variants`, `quotations`, `quotation_lines`, `orders`, `order_lines`, `deposits`
    - Use UUID primary keys with `uuid_generate_v4()`
    - Add all foreign key constraints, CHECK constraints for enum fields, and `created_at`/`updated_at` columns
    - Create indexes on foreign key columns and frequently filtered columns
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 11.5_

  - [x] 2.2 Create RLS policies migration at `supabase/migrations/002_rls_policies.sql`
    - Create `get_user_role()` function reading from `auth.jwt() -> 'user_metadata' ->> 'role'`
    - Enable RLS on all application tables
    - Create admin full-access policies on all tables
    - Create vendedor scoped policies on `quotations` and `orders` (SELECT, INSERT, UPDATE where `seller_id = auth.uid()`)
    - Create authenticated-user policies for `clients` (SELECT, INSERT, UPDATE) and `products`/`variants` (SELECT)
    - Create child-table policies for `quotation_lines`, `order_lines`, `deposits` using EXISTS subqueries
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [x] 2.3 Create seed data file at `supabase/seed.sql`
    - Convert data from `src/lib/mockData.ts` to equivalent SQL INSERT statements
    - Include clients, products, variants, quotations, quotation_lines, orders, order_lines, and deposits
    - _Requirements: 10.1_

- [x] 3. Create generated types placeholder and type mappings
  - [x] 3.1 Create `src/types/database.ts` placeholder with Database type structure
    - Define the `Database` interface structure matching the schema (tables, views, functions)
    - This will be replaced by `pnpm db:types` once connected to a real project
    - _Requirements: 8.1, 8.3, 8.4_

  - [x] 3.2 Extend `src/types/auth.ts` with Supabase-specific auth types
    - Add `SupabaseAuthState` interface with `user`, `isAuthenticated`, `loading` fields
    - Add `SupabaseAuthContextValue` interface with `login(email, password)` and `logout()` methods
    - _Requirements: 2.1, 2.2_

- [x] 4. Implement query layer
  - [x] 4.1 Create shared query utilities at `src/lib/queries/shared.ts`
    - Implement `SupabaseQueryError` class with `message`, `code`, `details`
    - Implement `handleSupabaseError()` function that throws `SupabaseQueryError`
    - Implement `paginationRange()` with defaults page=1, pageSize=50
    - Implement `deduplicateRequest()` for request deduplication within 100ms
    - _Requirements: 5.2, 5.5, 6.5, 11.3_

  - [x] 4.2 Write property tests for query utilities at `src/lib/queries/shared.property.test.ts`
    - **Property 3: Query error handling produces typed errors**
    - **Property 5: Pagination range calculation**
    - **Property 8: Request deduplication**
    - **Property 11: Cache staleness decision**
    - **Validates: Requirements 5.2, 5.5, 6.5, 11.3, 11.4**

  - [x] 4.3 Create client queries at `src/lib/queries/clients.ts`
    - Implement `getClients`, `createClient`, `updateClient`, `deleteClient`
    - Use explicit `.select()` projections for minimal payload
    - Include pagination via `paginationRange()`
    - Map snake_case DB rows to camelCase application models
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 11.1_

  - [x] 4.4 Create product queries at `src/lib/queries/products.ts`
    - Implement `getProducts`, `updateVariantStock`, `addVariant`
    - Use embedded relations: `products(*, variants(*))`
    - Map nested variants from DB format to application format
    - _Requirements: 5.1, 5.3, 5.4, 11.2_

  - [x] 4.5 Create quotation queries at `src/lib/queries/quotations.ts`
    - Implement `getQuotations`, `createQuotation`, `updateQuotation`, `approveQuotation`, `rejectQuotation`
    - Use embedded relations: `quotations(*, quotation_lines(*))`
    - Map nested quotation_lines to `lines` array in application model
    - _Requirements: 5.1, 5.3, 5.4, 11.2_

  - [x] 4.6 Create order queries at `src/lib/queries/orders.ts`
    - Implement `getOrders`, `createOrder`, `createOrderFromQuotation`, `markOrderDelivered`, `addDeposit`, `removeDeposit`
    - Use embedded relations: `orders(*, order_lines(*), deposits(*))`
    - Map nested order_lines to `lines` and deposits appropriately
    - _Requirements: 5.1, 5.3, 5.4, 11.2_

  - [x] 4.7 Write property tests for data mappers at `src/lib/queries/mappers.property.test.ts`
    - **Property 4: Database row mapping round-trip preserves data**
    - **Validates: Requirements 5.3**

- [x] 5. Checkpoint - Ensure all query layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement authentication layer
  - [x] 6.1 Create Supabase auth context at `src/lib/SupabaseAuthContext.tsx`
    - Implement `SupabaseAuthProvider` component
    - Listen to `onAuthStateChange` for `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`
    - Extract role from `user.user_metadata.role`
    - Map Supabase User to application User type
    - Implement `login(email, password)` using `supabase.auth.signInWithPassword`
    - Implement `logout()` using `supabase.auth.signOut`
    - Sanitize auth errors (never reveal which credential failed)
    - Expose `loading` state for initial session restoration
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 6.2 Create `src/hooks/useSupabaseAuth.ts` hook
    - Consume `SupabaseAuthContext` and expose typed auth state/methods
    - _Requirements: 2.1, 2.2_

  - [x] 6.3 Write property tests for auth at `src/lib/SupabaseAuthContext.property.test.ts`
    - **Property 1: Role extraction preserves metadata role**
    - **Property 2: Auth error messages never reveal credential details**
    - **Validates: Requirements 2.2, 2.4**

- [x] 7. Implement real-time subscription layer
  - [x] 7.1 Create channel configuration at `src/lib/realtime/channels.ts`
    - Define channel names and configuration for each table
    - Define reconnection constants (maxRetries: 3, baseDelay: 1000ms, backoffFactor: 2)
    - _Requirements: 7.1, 7.6_

  - [x] 7.2 Create generic subscription hook at `src/lib/realtime/useRealtimeSubscription.ts`
    - Subscribe to PostgreSQL changes on mount for the given table
    - Handle INSERT, UPDATE, DELETE events via callbacks
    - Unsubscribe on unmount via `supabase.removeChannel()`
    - Implement exponential backoff reconnection (3 retries: 1s, 2s, 4s)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 8. Implement React data hooks
  - [x] 8.1 Create `src/hooks/useClients.ts`
    - Fetch clients with loading/error states
    - Implement optimistic create, update, delete with rollback on failure
    - Integrate real-time subscription for live updates
    - Implement cache staleness check (re-fetch if older than 30s)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 11.4_

  - [x] 8.2 Create `src/hooks/useProducts.ts`
    - Fetch products with nested variants
    - Implement optimistic stock update and variant addition with rollback
    - Integrate real-time subscription
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 8.3 Create `src/hooks/useQuotations.ts`
    - Fetch quotations with nested lines
    - Implement optimistic create, update, approve, reject with rollback
    - Integrate real-time subscription
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 8.4 Create `src/hooks/useOrders.ts`
    - Fetch orders with nested lines and deposits
    - Implement optimistic create, deliver, deposit add/remove with rollback
    - Integrate real-time subscription
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 8.5 Write property tests for data hooks at `src/hooks/useClients.property.test.ts`
    - **Property 6: Optimistic update rollback restores original state**
    - **Property 7: Successful mutation replaces optimistic value with server data**
    - **Property 9: Real-time events update local state correctly**
    - **Validates: Requirements 6.2, 6.3, 6.4, 7.2, 7.3, 7.4**

- [x] 9. Checkpoint - Ensure all hook and auth tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement DataProvider facade and wire application
  - [x] 10.1 Create `src/lib/SupabaseDataProvider.tsx`
    - Wrap Supabase data hooks and expose the same interface as `DataContext`
    - Provide `data` object and `dispatch`-compatible mutation layer
    - _Requirements: 10.3_

  - [x] 10.2 Create `src/lib/DataProvider.tsx` facade
    - Check if `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set
    - If configured: render `SupabaseDataProvider`
    - If not configured: render existing mock `DataProvider` from `DataContext.tsx`
    - _Requirements: 10.2, 10.3, 10.4_

  - [x] 10.3 Update `src/App.tsx` to use new providers
    - Replace `AuthProvider` with conditional Supabase/Mock auth provider
    - Replace `DataProvider` import to use the facade from `src/lib/DataProvider.tsx`
    - Maintain existing component tree structure
    - _Requirements: 10.3, 10.4_

  - [x] 10.4 Write property test for URL validation at `src/lib/supabase.property.test.ts`
    - **Property 10: URL validation warning**
    - **Validates: Requirements 9.4**

- [x] 11. Final checkpoint - Ensure all tests pass and build succeeds
  - Run `pnpm test` and `pnpm build` to verify everything compiles and passes
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 11 correctness properties defined in the design document
- The `DataProvider` facade ensures existing components work unchanged regardless of backend
- SQL migration files go in `supabase/migrations/` and seed data in `supabase/seed.sql`
- The generated `src/types/database.ts` should be regenerated via `pnpm db:types` once connected to a real Supabase project
