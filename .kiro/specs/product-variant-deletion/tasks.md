# Implementation Plan: Product & Variant Deletion

## Overview

Implement deletion capabilities for products and individual variants in the SYK Dashboard inventory module. The implementation follows the existing optimistic update pattern (check references → apply optimistic removal → execute mutation → rollback on failure). All deletion operations are admin-only, enforced at both the UI layer (`RoleGate`) and the database layer (RLS policies). The system performs referential integrity checks before allowing deletion (active orders, pending quotations) and enforces a last-variant guard.

## Tasks

- [x] 1. Add action types and dataReducer cases
  - [x] 1.1 Add `PRODUCT_DELETE` and `VARIANT_DELETE` action types to `src/types/actions.ts`
    - Add to `DataAction` union: `{ type: 'PRODUCT_DELETE'; payload: { id: string } }`
    - Add to `DataAction` union: `{ type: 'VARIANT_DELETE'; payload: { productId: string; variantId: string } }`
    - _Requirements: 1.2, 2.2_

  - [x] 1.2 Handle `PRODUCT_DELETE` and `VARIANT_DELETE` in `src/lib/dataReducer.ts`
    - `PRODUCT_DELETE`: filter out the product from `state.products` by `id`
    - `VARIANT_DELETE`: map products, filter out the targeted variant from the matching product's `variants` array
    - _Requirements: 1.2, 1.3, 2.2, 2.3_

  - [x] 1.3 Write property test for Product deletion (Property 1)
    - **Property 1: Product deletion removes product and all its variants from state**
    - Add to `src/lib/dataReducer.property.test.ts`
    - Generate random `AppData` with 1–10 products, each with 1–5 variants
    - Dispatch `PRODUCT_DELETE` for a randomly chosen product
    - Assert resulting state does NOT contain the deleted product
    - Assert no variant belonging to the deleted product exists in the result
    - Minimum 100 iterations (`{ numRuns: 100 }`)
    - **Validates: Requirements 1.2**

  - [x] 1.4 Write property test for Variant deletion (Property 2)
    - **Property 2: Variant deletion removes only the targeted variant**
    - Add to `src/lib/dataReducer.property.test.ts`
    - Generate random products with 2+ variants, pick a random variant to delete
    - Dispatch `VARIANT_DELETE` for that variant
    - Assert the product still exists with exactly one fewer variant
    - Assert the removed variant is the targeted one and all others remain unchanged
    - Minimum 100 iterations (`{ numRuns: 100 }`)
    - **Validates: Requirements 2.2**

- [x] 2. Checkpoint - Validate reducer changes
  - Ensure all tests pass (`pnpm test`), ask the user if questions arise.

- [x] 3. Implement query functions for reference checks and deletion
  - [x] 3.1 Add `DeletionBlockReason` interface and reference check functions to `src/lib/queries/products.ts`
    - Export `DeletionBlockReason` interface: `{ type: 'active_order' | 'pending_quotation' | 'last_variant'; message: string }`
    - Implement `checkProductReferences(productId: string): Promise<DeletionBlockReason | null>`
      - Query `order_lines` joined with `orders` (status = 'activo') joined with `variants` (product_id = productId)
      - Query `quotation_lines` joined with `quotations` (status = 'pendiente') joined with `variants` (product_id = productId)
      - Return appropriate `DeletionBlockReason` with Spanish message, or `null` if no references
    - Implement `checkVariantReferences(variantId: string): Promise<DeletionBlockReason | null>`
      - Query `order_lines` joined with `orders` (status = 'activo') where variant_id = variantId
      - Query `quotation_lines` joined with `quotations` (status = 'pendiente') where variant_id = variantId
      - Return appropriate `DeletionBlockReason` with Spanish message, or `null` if no references
    - _Requirements: 3.1, 3.2, 4.1, 4.2_

  - [x] 3.2 Add `deleteProduct` and `deleteVariant` query functions to `src/lib/queries/products.ts`
    - `deleteProduct(productId: string): Promise<void>` — DELETE from `products` where id = productId (CASCADE removes variants)
    - `deleteVariant(variantId: string): Promise<void>` — DELETE from `variants` where id = variantId
    - Use `handleSupabaseError` on failure
    - _Requirements: 1.2, 2.2_

  - [x] 3.3 Write property test for product reference check (Property 4)
    - **Property 4: Product reference check blocks iff variants in active orders or pending quotations**
    - Create `src/lib/queries/products.property.test.ts`
    - Generate random state with products, variants, orders (with status), quotations (with status), and line items
    - Implement a pure reference-check oracle function that scans the generated data
    - Assert the query function result matches the oracle: blocked iff at least one variant of the product is in an active order or pending quotation
    - Minimum 100 iterations (`{ numRuns: 100 }`)
    - **Validates: Requirements 3.1, 3.2**

  - [x] 3.4 Write property test for variant reference check (Property 5)
    - **Property 5: Variant reference check blocks iff variant in active orders or pending quotations**
    - Add to `src/lib/queries/products.property.test.ts`
    - Generate random state with variants, orders, quotations, and line items
    - Assert the query function result matches the oracle: blocked iff the variant appears in an active order or pending quotation
    - Minimum 100 iterations (`{ numRuns: 100 }`)
    - **Validates: Requirements 4.1, 4.2**

  - [x] 3.5 Write property test for last-variant guard (Property 6)
    - **Property 6: Last-variant guard blocks iff product has exactly one variant**
    - Add to `src/lib/queries/products.property.test.ts`
    - Generate random products with 1–5 variants
    - Assert: guard blocks when variants.length === 1, allows when variants.length >= 2
    - Minimum 100 iterations (`{ numRuns: 100 }`)
    - **Validates: Requirements 5.1, 5.2**

- [x] 4. Checkpoint - Validate query functions
  - Ensure all tests pass (`pnpm test`), ask the user if questions arise.

- [x] 5. Implement hook methods with check-first + optimistic + rollback pattern
  - [x] 5.1 Add `deleteProduct` method to `src/hooks/useProducts.ts`
    - Implement check-first pattern: call `checkProductReferences` before any state change
    - If blocked, throw error with the Spanish message (no optimistic update applied)
    - If clear, save `previousStateRef.current = products`, apply optimistic removal via `setProducts(prev => prev.filter(...))`
    - Call `productQueries.deleteProduct(productId)`
    - On failure: rollback to `previousStateRef.current`, set error message
    - Add `deleteProduct` to the returned `UseProductsResult` interface
    - _Requirements: 1.2, 1.3, 1.4, 3.1, 3.2_

  - [x] 5.2 Add `deleteVariant` method to `src/hooks/useProducts.ts`
    - Implement last-variant guard: if `product.variants.length === 1`, throw error with Spanish message
    - Implement check-first pattern: call `checkVariantReferences` before any state change
    - If blocked, throw error with the Spanish message
    - If clear, save `previousStateRef.current = products`, apply optimistic removal via `setProducts`
    - Call `productQueries.deleteVariant(variantId)`
    - On failure: rollback to `previousStateRef.current`, set error message
    - Add `deleteVariant` to the returned `UseProductsResult` interface
    - _Requirements: 2.2, 2.3, 2.4, 4.1, 4.2, 5.1, 5.2_

  - [x] 5.3 Write property test for optimistic rollback (Property 3)
    - **Property 3: Optimistic deletion rollback restores original state**
    - Create `src/hooks/useProducts.property.test.ts`
    - Generate random product arrays
    - Simulate: save original → optimistically remove a product/variant → apply rollback (restore from saved)
    - Assert the rolled-back state is deeply equal to the original state
    - Minimum 100 iterations (`{ numRuns: 100 }`)
    - **Validates: Requirements 1.4, 2.4**

- [x] 6. Wire dispatch cases in SupabaseDataProvider
  - [x] 6.1 Add `PRODUCT_DELETE` and `VARIANT_DELETE` cases to `src/lib/SupabaseDataProvider.tsx`
    - `case 'PRODUCT_DELETE': productsHook.deleteProduct(action.payload.id); break;`
    - `case 'VARIANT_DELETE': productsHook.deleteVariant(action.payload.productId, action.payload.variantId); break;`
    - _Requirements: 1.2, 2.2_

- [x] 7. Checkpoint - Validate data layer integration
  - Ensure all tests pass (`pnpm test`) and the project builds (`pnpm build`), ask the user if questions arise.

- [x] 8. Implement UI changes in InventoryDetailPage
  - [x] 8.1 Add delete product button and confirmation dialog to `src/pages/InventoryDetailPage.tsx`
    - Add a destructive "Eliminar Producto" button in the header area, wrapped in `<RoleGate allowedRoles={['admin']}>`
    - Wire to a `ConfirmDialog` with `variant="destructive"`, title "Eliminar Producto", message including product name and warning that all variants will be removed
    - On confirm: dispatch `{ type: 'PRODUCT_DELETE', payload: { id: product.id } }`
    - On successful deletion: navigate to `/inventario`
    - Handle errors: display blocking reason in an inline error alert near the button
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1_

  - [x] 8.2 Add delete variant button column and confirmation dialog to `src/pages/InventoryDetailPage.tsx`
    - Add a new column to the variant `DataTable` with a trash/delete icon button per row
    - Wrap button in `<RoleGate allowedRoles={['admin']}>`
    - Wire to a `ConfirmDialog` with `variant="destructive"`, title "Eliminar Variante", message identifying the variant by size and color
    - On confirm: dispatch `{ type: 'VARIANT_DELETE', payload: { productId: product.id, variantId: variant.id } }`
    - Handle errors: display blocking reason (reference check or last-variant guard) in an inline error alert
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 5.1_

  - [x] 8.3 Add error display for deletion blocking messages
    - Add state for `deletionError: string | null`
    - Display error as an inline alert (red bg, Spanish message) below the action buttons when set
    - Clear error on dialog close or after a timeout
    - Error messages: "No se puede eliminar: este producto está referenciado en pedidos activos.", "No se puede eliminar: este producto está referenciado en cotizaciones pendientes.", "No se puede eliminar la última variante. Elimina el producto completo en su lugar.", "Error al eliminar. Intenta nuevamente."
    - _Requirements: 1.4, 2.4, 3.1, 4.1, 5.1_

- [x] 9. Verify RLS policies cover DELETE operations
  - [x] 9.1 Review existing RLS migration and verify admin_all policies cover DELETE
    - Read `supabase/migrations/002_rls_policies.sql` to confirm `admin_all` policies use `FOR ALL` on both `products` and `variants` tables
    - If policies already cover DELETE for admin role: document as verified, no new migration needed
    - If policies do NOT cover DELETE: create `supabase/migrations/006_delete_policies.sql` with explicit DELETE policies for both tables
    - _Requirements: 6.1, 6.2_

- [x] 10. Checkpoint - Full integration verification
  - Ensure all tests pass (`pnpm test`) and the project builds cleanly (`pnpm build`), ask the user if questions arise.

- [x] 11. Write unit and integration tests for the UI
  - [x] 11.1 Write unit tests for InventoryDetailPage deletion UI
    - Create or extend `src/pages/InventoryDetailPage.test.tsx`
    - Test: delete product button visible for admin role (Req 1.1)
    - Test: delete product button hidden for vendedor role (Req 1.5)
    - Test: ConfirmDialog shows product name on delete (Req 1.1)
    - Test: delete variant button visible for admin role (Req 2.1)
    - Test: delete variant button hidden for vendedor role (Req 2.5)
    - Test: ConfirmDialog shows variant size/color on variant delete (Req 2.1)
    - Test: error message displayed when deletion is blocked (Req 3.1, 4.1, 5.1)
    - Test: navigates to /inventario after product deletion (Req 1.3)
    - _Requirements: 1.1, 1.5, 2.1, 2.5, 3.1, 4.1, 5.1_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass (`pnpm test`) and the project builds cleanly (`pnpm build`), ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 6 correctness properties defined in the design document
- The check-first pattern (task 5) avoids the flash of content disappearing then reappearing on blocked deletions
- RLS verification (task 9) may result in no code changes if existing `admin_all` policies already cover DELETE
- Spanish error messages are used throughout the UI (consistent with project conventions)
- All deletion UI is wrapped in `RoleGate` to enforce admin-only access at the component level
