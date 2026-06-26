# Implementation Plan: Dashboard UI Redesign

## Overview

Bottom-up migration from vanilla CSS to TailwindCSS with a dark theme. Each phase builds on the previous: foundation → primitives → composites → layout → pages → cleanup. Component APIs remain unchanged; only JSX class attributes and styling infrastructure change.

## Tasks

- [x] 1. Set up TailwindCSS foundation and design tokens
  - [x] 1.1 Install TailwindCSS, PostCSS, Autoprefixer, and @fontsource/inter
    - Run `pnpm add -D tailwindcss postcss autoprefixer` and `pnpm add @fontsource/inter`
    - Create `postcss.config.js` with tailwindcss and autoprefixer plugins
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Create tailwind.config.ts with custom theme tokens
    - Define custom colors (bg-primary, bg-secondary, surface, secondary, text-muted, accent-soft, highlight, accent)
    - Define semantic status colors (success, warning, destructive) with muted variants
    - Define fontFamily (Inter + system fallback for sans, Fira Code for mono)
    - Define custom borderRadius (xl: 12px, 2xl: 16px)
    - Define custom boxShadow (soft, elevated, glow)
    - Define custom spacing, transitionDuration, and maxWidth tokens
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.3 Replace src/index.css with src/globals.css using Tailwind directives
    - Create `src/globals.css` with @tailwind base/components/utilities directives
    - Add @layer base with html smoothing, body dark background, #root flex container
    - Add focus-visible ring utility, sr-only utility, and [data-tabular] mono font
    - Import `@fontsource/inter` in main.tsx
    - Update `src/main.tsx` to import `globals.css` instead of `index.css`
    - Update `vite.config.ts` content paths if needed
    - _Requirements: 1.5, 2.1, 2.2, 2.3_

  - [x] 1.4 Verify foundation setup compiles and existing tests pass
    - Run `pnpm build` to confirm no type or compilation errors
    - Run `pnpm test` to confirm all existing property tests still pass
    - _Requirements: 1.5, 1.6_

- [x] 2. Migrate primitive components (Phase 2)
  - [x] 2.1 Migrate Button component to Tailwind utility classes
    - Replace CSS class selectors with Tailwind classes for all 4 variants (primary, secondary, destructive, ghost) and 3 sizes (sm, md, lg)
    - Apply common classes: rounded-xl, transition-all, duration-150, focus-visible ring, disabled states
    - Remove `import './Button.css'` and delete `src/components/Button.css`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [x] 2.2 Migrate FormField component to Tailwind utility classes
    - Style label with text-text-muted, input wrapper, and error state with text-destructive
    - Apply input styles: bg-bg-secondary, border-secondary, rounded-xl, focus:border-accent, focus:shadow-glow
    - Remove `import './FormField.css'` and delete `src/components/FormField.css`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 2.3 Create new StatusBadge component
    - Create `src/components/StatusBadge.tsx` with interface: status ('active' | 'pending' | 'completed' | 'critical'), children
    - Apply pill shape: inline-flex, items-center, rounded-full, px-2.5, py-0.5, text-xs, font-medium
    - Map status to color classes (active→success, pending→warning, completed→secondary, critical→destructive)
    - Export named component and interface type
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 2.4 Migrate EmptyState component to Tailwind utility classes
    - Apply flex column centered layout, text-text-muted for description, accent for action button
    - Remove `import './EmptyState.css'` and delete `src/components/EmptyState.css`
    - _Requirements: 11.4, 11.5_

  - [x] 2.5 Migrate ConfirmDialog component to Tailwind utility classes
    - Style dialog message and actions container with Tailwind gap and flex utilities
    - Apply fade-in backdrop transition classes
    - Remove `import './ConfirmDialog.css'` and delete `src/components/ConfirmDialog.css`
    - _Requirements: 12.5_

  - [x] 2.6 Write property test for dark palette WCAG contrast compliance
    - **Property 1: Dark palette color pairs meet WCAG AA contrast thresholds**
    - **Validates: Requirements 2.2, 13.1**
    - Update `src/lib/contrastCheck.property.test.ts` to validate all defined dark palette text/background pairs
    - Test that all normal-text pairs achieve ≥ 4.5:1 ratio and large-text pairs achieve ≥ 3:1 ratio
    - Use fast-check to generate perturbations around defined color pairs

- [x] 3. Checkpoint — Verify primitives migration
  - Ensure all tests pass, ask the user if questions arise.
  - Run `pnpm build` and `pnpm test` to confirm no regressions

- [x] 4. Migrate composite components (Phase 3)
  - [x] 4.1 Migrate MetricCard component to Tailwind utility classes
    - Apply container: bg-surface, rounded-2xl, shadow-soft, p-5, hover:-translate-y-0.5, hover:shadow-elevated, transition-all, duration-200
    - Apply icon container variant backgrounds (secondary/20, accent/20, warning/20, destructive/20)
    - Style title as text-text-muted and value as text-white font-bold text-2xl
    - Remove `import './MetricCard.css'` and delete `src/components/MetricCard.css`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 4.2 Migrate DataTable component to Tailwind utility classes
    - Apply wrapper: bg-surface, rounded-2xl, shadow-soft, overflow-hidden
    - Style header: bg-bg-secondary, text-text-muted, uppercase, text-xs, tracking-wider
    - Style rows: border-b border-secondary/50, hover:bg-bg-secondary, transition-colors, duration-150
    - Style clickable rows: cursor-pointer
    - Style empty state with centered layout and muted text
    - Remove `import './DataTable.css'` and delete `src/components/DataTable.css`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 4.3 Migrate AlertBell component to Tailwind utility classes
    - Style button with relative positioning, text-text-muted, hover:text-white
    - Style badge count with absolute position, bg-destructive, rounded-full, text-xs
    - Remove `import './AlertBell.css'` and delete `src/components/AlertBell.css`
    - _Requirements: 5.3_

  - [x] 4.4 Migrate AlertPanel component to Tailwind utility classes
    - Apply dropdown: bg-surface, rounded-2xl, shadow-elevated, border border-secondary/30
    - Style severity indicators: critical→border-l-4 border-destructive, warning→border-l-4 border-warning
    - Style header with title and count badge
    - Remove `import './AlertPanel.css'` and delete `src/components/AlertPanel.css`
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x] 4.5 Create new LoadingSkeleton component
    - Create `src/components/LoadingSkeleton.tsx` with interface: variant ('card' | 'row' | 'text' | 'circle'), count, className
    - Apply animate-pulse with gradient from surface to bg-secondary, rounded-xl
    - Implement dimension variants matching MetricCard, DataTable row, text block, and circle shapes
    - Export named component and interface type
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 4.6 Write unit tests for StatusBadge and LoadingSkeleton components
    - Test StatusBadge renders correct color classes for each status variant
    - Test LoadingSkeleton renders correct shape classes for each variant
    - Test LoadingSkeleton respects count prop to render multiple elements
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3_

- [x] 5. Checkpoint — Verify composites migration
  - Ensure all tests pass, ask the user if questions arise.
  - Run `pnpm build` and `pnpm test` to confirm no regressions

- [x] 6. Migrate layout components (Phase 4)
  - [x] 6.1 Migrate Sidebar component to Tailwind utility classes
    - Apply bg-bg-secondary, w-64 expanded / w-16 collapsed, transition-all duration-200
    - Style nav items: hover:bg-surface, active item with border-l-4 border-accent + bg tint
    - Implement collapsed state: icon-only display with tooltip on hover
    - Style brand logo area at top and user info at bottom
    - On mobile (<768px): render as overlay drawer with backdrop
    - Remove co-located CSS file
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 6.2 Migrate TopBar component to Tailwind utility classes
    - Apply sticky top-0, bg-bg-primary, border-b border-surface, h-16, z-10
    - Style hamburger button for mobile, search placeholder for desktop
    - Position AlertBell to the right with flex justify-between
    - Remove co-located CSS file
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.3 Migrate AppLayout component to Tailwind utility classes
    - Apply CSS Grid: grid grid-cols-[auto_1fr], min-h-dvh
    - Main area: flex flex-col with sticky TopBar + scrollable content
    - Content area: max-w-content mx-auto px-4 lg:px-6 py-6
    - On mobile: single column layout
    - Remove `import './AppLayout.css'` and delete `src/components/AppLayout.css`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Checkpoint — Verify layout migration
  - Ensure all tests pass, ask the user if questions arise.
  - Run `pnpm build` and `pnpm test` to confirm no regressions

- [x] 8. Migrate page components (Phase 5)
  - [x] 8.1 Migrate LoginPage to Tailwind utility classes
    - Apply full-viewport centered: min-h-dvh flex items-center justify-center bg-bg-primary
    - Style card: bg-bg-secondary rounded-2xl shadow-elevated border border-surface p-8 w-full max-w-md
    - Style role selection cards, title, subtitle, and submit button
    - Remove `import './LoginPage.css'` and delete `src/pages/LoginPage.css`
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 8.2 Migrate DashboardPage to Tailwind utility classes
    - Style title as text-2xl font-bold text-white
    - Apply MetricCard grid: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4
    - Style alerts section with list items, severity indicators, and hover states
    - Remove `import './DashboardPage.css'` and delete `src/pages/DashboardPage.css`
    - _Requirements: 6.5, 2.1, 2.6_

  - [x] 8.3 Migrate QuotationListPage, QuotationFormPage, and QuotationDetailPage to Tailwind
    - Replace CSS classes with Tailwind utilities for layout, typography, spacing
    - Apply consistent dark theme surfaces and text colors
    - Remove co-located CSS files for all three pages
    - _Requirements: 2.1, 2.6, 3.1_

  - [x] 8.4 Migrate OrderListPage, OrderFormPage, and OrderDetailPage to Tailwind
    - Replace CSS classes with Tailwind utilities for layout, typography, spacing
    - Apply consistent dark theme surfaces and text colors
    - Remove co-located CSS files for all three pages
    - _Requirements: 2.1, 2.6, 3.1_

  - [x] 8.5 Migrate InventoryListPage and InventoryDetailPage to Tailwind
    - Replace CSS classes with Tailwind utilities for layout, typography, spacing
    - Apply consistent dark theme surfaces and text colors
    - Remove co-located CSS files for both pages
    - _Requirements: 2.1, 2.6, 3.1_

  - [x] 8.6 Migrate ClientListPage to Tailwind utility classes
    - Replace CSS classes with Tailwind utilities for layout, typography, spacing
    - Style ClientForm and InlineClientForm sub-components with Tailwind
    - Remove co-located CSS files (ClientListPage.css, ClientForm.css, InlineClientForm.css)
    - _Requirements: 2.1, 2.6, 3.1_

  - [x] 8.7 Migrate AccessDeniedPage and NotFoundPage to Tailwind
    - Apply dark-themed centered card layout with appropriate messaging
    - Remove co-located CSS files for both pages
    - _Requirements: 2.1, 14.1_

  - [x] 8.8 Migrate remaining component CSS files (Modal, Sidebar, TopBar, DepositForm, DepositSection, DueDateIndicator)
    - Migrate any remaining components that still have co-located .css files
    - Apply consistent dark theme styling with Tailwind utilities
    - Remove all remaining co-located .css files
    - _Requirements: 1.6, 2.6, 12.1, 12.2, 12.3, 12.4_

- [x] 9. Checkpoint — Verify pages migration
  - Ensure all tests pass, ask the user if questions arise.
  - Run `pnpm build` and `pnpm test` to confirm no regressions

- [x] 10. Final cleanup and verification (Phase 6)
  - [x] 10.1 Remove legacy CSS files and verify no CSS imports remain
    - Delete `src/index.css` (replaced by globals.css)
    - Delete `src/App.css` if still present
    - Search codebase for any remaining `.css` imports and remove them
    - Verify no orphaned .css files exist in src/components/ or src/pages/
    - _Requirements: 1.6_

  - [x] 10.2 Final build verification and test suite run
    - Run `pnpm build` to confirm clean production build with no errors
    - Run `pnpm test` to confirm all property tests and unit tests pass
    - Run `pnpm lint` to confirm no linting issues
    - Verify bundle size is reasonable (no unexpected CSS bloat)
    - _Requirements: 1.5, 1.6, 2.6, 13.4_

  - [x] 10.3 Write integration tests for accessibility compliance
    - Test keyboard navigation through Sidebar (arrow keys, Enter/Space)
    - Test focus trap in mobile Sidebar overlay
    - Test all ARIA attributes preserved after migration
    - Verify focus-visible ring appears on interactive elements
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Confirm the migration is complete: all .css files removed, Tailwind classes applied, dark theme consistent across all pages.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between phases
- Existing property tests serve as regression guards — they must pass at every checkpoint
- Component APIs (props interfaces) remain unchanged throughout the migration
- The single PBT property validates WCAG contrast ratios for the new dark palette color pairs
- Use `pnpm` for all package management commands
