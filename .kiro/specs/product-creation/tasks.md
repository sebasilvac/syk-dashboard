# Implementation Plan: Product Creation

## Overview

Implement a product creation flow in the SYK Dashboard inventory module. The implementation covers a pure validation module with property-based tests, a new route and page component, Supabase persistence, optimistic state updates, and accessibility compliance. All code follows existing project patterns (lazy-loaded pages, pure validators, Context + useReducer state, Supabase queries in `src/lib/queries/`).

## Tasks

- [x] 1. Create the pure validation module (`productValidation.ts`)
  - [x] 1.1 Implement `validateProductForm` function in `src/lib/productValidation.ts`
    - Define `ProductFormData` and `VariantFormData` interfaces
    - Export `validateProductForm(data: ProductFormData): ValidationError[]`
    - Validate: name non-empty, category non-empty, at least one variant, each variant's size/color non-empty, stock >= 0, minStock >= 0
    - Use dot-notation field identifiers for variant errors: `variants[0].size`, `variants[1].color`, etc.
    - Follow the same pattern as `src/lib/clientValidation.ts`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.1, 7.2, 7.3, 7.4_

  - [x] 1.2 Write property test: valid product form data produces no errors
    - **Property 1: Valid product form data produces no validation errors**
    - Create `src/lib/productValidation.property.test.ts`
    - Generate arbitrary valid ProductFormData (non-empty trimmed name, non-empty trimmed category, 1+ variants with non-empty size/color, stock >= 0, minStock >= 0)
    - Assert `validateProductForm` returns empty array
    - Minimum 100 iterations (`{ numRuns: 100 }`)
    - Tag: `Feature: product-creation, Property 1: Valid product form data produces no validation errors`
    - **Validates: Requirements 7.2**

  - [x] 1.3 Write property test: empty required string fields produce field-specific errors
    - **Property 2: Empty required string fields produce field-specific errors**
    - Generate arbitrary ProductFormData with at least one required string field empty or whitespace-only
    - Assert at least one error references the empty field
    - Minimum 100 iterations (`{ numRuns: 100 }`)
    - Tag: `Feature: product-creation, Property 2: Empty required string fields produce field-specific errors`
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 7.3**

  - [x] 1.4 Write property test: negative numeric fields produce field-specific errors
    - **Property 3: Negative numeric fields produce field-specific errors**
    - Generate arbitrary ProductFormData with at least one variant having stock < 0 or minStock < 0
    - Assert at least one error references the invalid variant field
    - Minimum 100 iterations (`{ numRuns: 100 }`)
    - Tag: `Feature: product-creation, Property 3: Negative numeric fields produce field-specific errors`
    - **Validates: Requirements 3.5, 3.6, 7.3**

  - [x] 1.5 Write property test: error count is monotonic with violations
    - **Property 4: Validation error count is monotonic with violations**
    - Generate arbitrary ProductFormData and count distinct violations (empty required fields + negative numerics)
    - Assert error array length >= violation count
    - Minimum 100 iterations (`{ numRuns: 100 }`)
    - Tag: `Feature: product-creation, Property 4: Validation error count is monotonic with violations`
    - **Validates: Requirements 7.3**

- [x] 2. Checkpoint - Validate the validation module
  - Ensure all tests pass (`pnpm test`), ask the user if questions arise.

- [x] 3. Add route registration and navigation infrastructure
  - [x] 3.1 Register `/inventario/nuevo` route in `src/App.tsx`
    - Add lazy import: `const ProductFormPage = lazy(() => import('@/pages/ProductFormPage'))`
    - Add route inside the `ProtectedRoute` + `AppLayout` group, BEFORE the `/inventario/:id` route (to avoid path conflict)
    - Route: `<Route path="/inventario/nuevo" element={<ProductFormPage />} />`
    - _Requirements: 1.4_

  - [x] 3.2 Add "Nuevo Producto" button to `src/pages/InventoryListPage.tsx`
    - Import `RoleGate` and `Button` components
    - Wrap a "Nuevo Producto" button inside `<RoleGate allowedRoles={['admin']}>` in the page header
    - Button navigates to `/inventario/nuevo` on click
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Implement the ProductFormPage component
  - [x] 4.1 Create `src/pages/ProductFormPage.tsx` with form structure
    - Default export for lazy loading
    - Local `FormState` with name, category, and variants array (each variant has key, size, color, stock, minStock as strings)
    - Initialize with one empty variant row
    - Render product name input field and category input field with associated labels (`htmlFor`/`id`)
    - Render variant rows section with size, color, stock, minStock fields per row
    - "Agregar Variante" button appends a new variant row
    - Remove button per variant row (disabled when only 1 row exists)
    - "Crear Producto" submit button and "Cancelar" button
    - "Cancelar" navigates to `/inventario`
    - Use `FormField` component and existing Tailwind theme tokens for consistent styling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 4.2 Add validation UI and submit logic to ProductFormPage
    - On submit: parse numeric fields (stock, minStock), build `ProductFormData`, call `validateProductForm`
    - If errors: display inline error messages using `aria-describedby` linked to inputs, do NOT call API
    - If valid: call `createProduct` from the `useProducts` hook, navigate to `/inventario` on success
    - On server error: display error message, retain form data
    - _Requirements: 3.7, 3.8, 4.3, 4.4, 4.5, 6.1, 6.2_

  - [x] 4.3 Ensure accessibility compliance in ProductFormPage
    - Every input has a visible label with matching `htmlFor`/`id`
    - Error messages use `aria-describedby` referencing the input
    - All interactive elements are keyboard-navigable (tab traversal)
    - Use theme tokens (bg-primary, bg-secondary, text-primary, text-muted, accent, secondary) for dark mode support
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 5. Implement the data layer (query + reducer + hook)
  - [x] 5.1 Add `createProduct` query function to `src/lib/queries/products.ts`
    - Insert product row into `products` table (name, category)
    - On success, batch-insert all variants into `variants` table with the new `product_id`
    - Return full `Product` object with real UUIDs (use `mapProduct`)
    - Handle errors: product insert failure, partial variant failure
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

  - [x] 5.2 Add `PRODUCT_CREATE` action type to `src/types/actions.ts`
    - Add to `DataAction` union: `{ type: 'PRODUCT_CREATE'; payload: { name: string; category: string; variants: Omit<Variant, 'id'>[] } }`
    - _Requirements: 5.1_

  - [x] 5.3 Handle `PRODUCT_CREATE` in `src/lib/dataReducer.ts`
    - Create optimistic product with `crypto.randomUUID()` for product and each variant ID
    - Append to `state.products`
    - _Requirements: 5.1_

  - [x] 5.4 Add `createProduct` method to `src/hooks/useProducts.ts`
    - Store previous state in `previousStateRef` before optimistic update
    - Apply optimistic update (product with temp UUIDs)
    - Call `productQueries.createProduct(name, category, variants)`
    - On success: replace optimistic record with server-confirmed record
    - On failure: rollback to previous state, surface error
    - Return the method from the hook's return object
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Checkpoint - Full integration verification
  - Ensure all tests pass (`pnpm test`) and the project builds (`pnpm build`), ask the user if questions arise.

- [x] 7. Integration wiring and final tests
  - [x] 7.1 Wire all components end-to-end
    - Verify ProductFormPage imports and uses `validateProductForm` from `src/lib/productValidation.ts`
    - Verify ProductFormPage calls `createProduct` from `useProducts` hook
    - Verify navigation flow: InventoryListPage → ProductFormPage → back to InventoryListPage
    - Verify the route order in App.tsx doesn't conflict with `/inventario/:id`
    - _Requirements: 1.2, 1.4, 4.3_

  - [x] 7.2 Write unit tests for ProductFormPage
    - Create `src/pages/ProductFormPage.test.tsx`
    - Test: renders name and category fields (Req 2.1)
    - Test: renders at least one variant row on load (Req 2.3)
    - Test: "Agregar Variante" adds a new row (Req 2.4)
    - Test: remove button removes a variant row (Req 2.5)
    - Test: remove button disabled when only one row (Req 2.6)
    - Test: "Cancelar" navigates to /inventario (Req 2.8)
    - Test: displays inline errors on validation failure (Req 3.7)
    - Test: does not call API on validation failure (Req 3.8)
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.8, 3.7, 3.8_

  - [x] 7.3 Write integration tests for admin-only access
    - Test: "Nuevo Producto" button visible for admin (Req 1.1)
    - Test: "Nuevo Producto" button hidden for vendedor (Req 1.3)
    - _Requirements: 1.1, 1.3_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass (`pnpm test`) and the project builds cleanly (`pnpm build`), ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 4 correctness properties defined in the design document
- The validation module is implemented first (task 1) so it's available for both property tests and the form component
- Route registration (task 3) is placed BEFORE `/inventario/:id` to avoid path conflict with the dynamic segment
- Data layer (task 5) is independent of UI and can be developed in parallel with the form page (task 4)
