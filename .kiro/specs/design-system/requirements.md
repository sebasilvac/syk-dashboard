# Requirements Document

## Introduction

Design System para syk-dashboard: una capa de abstracción sobre shadcn/ui que provee componentes wrapper reutilizables, tokens de diseño y variantes configurables. El sistema permite desacoplar la aplicación de la implementación interna de shadcn/ui, facilitando cambios futuros sin impacto en el código de negocio. Los componentes exponen una API propia, consistente y extensible.

## Glossary

- **Design_System**: Capa de abstracción que contiene tokens, variantes y utilidades de diseño ubicada en `src/design-system/`
- **Wrapper_Component**: Componente en `src/components/ui/` que envuelve un componente base de shadcn/ui y expone una API propia al consumidor
- **Token**: Valor de diseño abstracto (spacing, typography, radius, shadows) definido como constante TypeScript en `src/design-system/tokens/`
- **Variant_Config**: Configuración declarativa de las variantes visuales de un componente, definida en `src/design-system/variants/`
- **Base_Component**: Componente generado por shadcn/ui ubicado en `src/lib/shadcn/`, consumido exclusivamente por los Wrapper_Components
- **Consumer**: Cualquier componente de página o feature que utiliza Wrapper_Components para construir la interfaz
- **Token_System**: Conjunto completo de tokens organizados por categoría (spacing, typography, radius, shadows, z-index)
- **Variant_Map**: Objeto Record de TypeScript que mapea nombres de variante a clases de Tailwind CSS

## Requirements

### Requirement 1: Token System

**User Story:** As a developer, I want a centralized token system with abstract design values, so that I can maintain visual consistency and change design decisions from a single source of truth.

#### Acceptance Criteria

1. THE Token_System SHALL export typed constants for spacing, typography, radius, shadows, and z-index categories
2. WHEN a Token value is modified, THE Token_System SHALL propagate the change to all Wrapper_Components that reference the modified Token
3. THE Token_System SHALL use abstract names (e.g., `sm`, `md`, `lg`, `xl`) instead of concrete pixel values in its public API
4. THE Token_System SHALL expose each category as an independent module importable from `@/design-system/tokens/`
5. IF a Consumer imports a Token that does not exist, THEN THE TypeScript compiler SHALL report a type error at compile time

### Requirement 2: Variant Configuration System

**User Story:** As a developer, I want declarative variant configurations separated from component logic, so that I can add or modify visual variants without touching component implementation.

#### Acceptance Criteria

1. THE Variant_Config SHALL define variant-to-class mappings as typed Record objects exported from `@/design-system/variants/`
2. WHEN a new variant value is added to a Variant_Config, THE TypeScript compiler SHALL enforce the variant is handled in the corresponding Wrapper_Component props type
3. THE Variant_Config SHALL support compound variants that combine multiple variant axes (e.g., variant + size)
4. THE Variant_Config SHALL include a `defaultVariants` export specifying the default value for each variant axis
5. IF a Consumer passes an invalid variant value, THEN THE TypeScript compiler SHALL report a type error at compile time

### Requirement 3: Button Wrapper Component

**User Story:** As a developer, I want a Button wrapper that exposes a clean API with loading state, variants, and sizes, so that I can use buttons consistently without knowing the underlying implementation.

#### Acceptance Criteria

1. THE Wrapper_Component for Button SHALL accept props: `variant`, `size`, `loading`, `disabled`, `children`, `type`, `onClick`, `className`, and `aria-label`
2. THE Wrapper_Component for Button SHALL support variants: `primary`, `secondary`, `destructive`, and `ghost`
3. THE Wrapper_Component for Button SHALL support sizes: `sm`, `md`, and `lg`
4. WHEN `loading` is true, THE Wrapper_Component for Button SHALL display a spinner indicator and disable pointer events
5. WHILE `loading` is true, THE Wrapper_Component for Button SHALL set `aria-busy="true"` on the rendered button element
6. THE Wrapper_Component for Button SHALL import the Base_Component from `@/lib/shadcn/` and not expose shadcn internals to the Consumer
7. WHEN no `variant` is provided, THE Wrapper_Component for Button SHALL default to `primary`
8. WHEN no `size` is provided, THE Wrapper_Component for Button SHALL default to `md`

### Requirement 4: Input Wrapper Component

**User Story:** As a developer, I want an Input wrapper with built-in error state and label support, so that I can build forms with consistent styling and accessibility.

#### Acceptance Criteria

1. THE Wrapper_Component for Input SHALL accept props: `label`, `error`, `placeholder`, `disabled`, `value`, `onChange`, `type`, `id`, and `name`
2. WHEN `error` is provided, THE Wrapper_Component for Input SHALL display the error message below the input with `role="alert"`
3. WHEN `error` is provided, THE Wrapper_Component for Input SHALL apply a destructive border style to the input element
4. THE Wrapper_Component for Input SHALL associate the label with the input using `htmlFor` and auto-generated `id` when no explicit `id` is provided
5. WHEN `error` is provided, THE Wrapper_Component for Input SHALL link the error message to the input via `aria-describedby`
6. THE Wrapper_Component for Input SHALL import the Base_Component from `@/lib/shadcn/` and not expose shadcn internals to the Consumer

### Requirement 5: Card Wrapper Component

**User Story:** As a developer, I want a Card wrapper with header, body, and footer slots, so that I can build content containers with consistent structure.

#### Acceptance Criteria

1. THE Wrapper_Component for Card SHALL accept props: `title`, `description`, `children`, `footer`, `variant`, and `className`
2. THE Wrapper_Component for Card SHALL support variants: `default`, `elevated`, and `outlined`
3. WHEN `title` is provided, THE Wrapper_Component for Card SHALL render a header section with the title text
4. WHEN `description` is provided, THE Wrapper_Component for Card SHALL render a description below the title
5. WHEN `footer` is provided, THE Wrapper_Component for Card SHALL render a footer section separated from the body content
6. THE Wrapper_Component for Card SHALL import the Base_Component from `@/lib/shadcn/` and not expose shadcn internals to the Consumer

### Requirement 6: Modal/Dialog Wrapper Component

**User Story:** As a developer, I want a Modal wrapper that handles accessibility, focus trapping, and animations, so that I can create dialogs without managing low-level behavior.

#### Acceptance Criteria

1. THE Wrapper_Component for Modal SHALL accept props: `open`, `onClose`, `title`, `description`, `children`, `footer`, and `size`
2. THE Wrapper_Component for Modal SHALL support sizes: `sm`, `md`, and `lg`
3. WHEN `open` transitions to true, THE Wrapper_Component for Modal SHALL trap keyboard focus within the modal content
4. WHEN the user presses Escape, THE Wrapper_Component for Modal SHALL invoke the `onClose` callback
5. WHEN the user clicks the overlay backdrop, THE Wrapper_Component for Modal SHALL invoke the `onClose` callback
6. WHILE `open` is true, THE Wrapper_Component for Modal SHALL set `aria-modal="true"` and `role="dialog"` on the dialog element
7. WHEN `open` transitions to true, THE Wrapper_Component for Modal SHALL prevent body scroll
8. THE Wrapper_Component for Modal SHALL import the Base_Component from `@/lib/shadcn/` and not expose shadcn internals to the Consumer

### Requirement 7: Badge Wrapper Component

**User Story:** As a developer, I want a Badge wrapper with semantic status variants, so that I can display status indicators consistently across the application.

#### Acceptance Criteria

1. THE Wrapper_Component for Badge SHALL accept props: `variant`, `size`, `children`, and `className`
2. THE Wrapper_Component for Badge SHALL support variants: `default`, `success`, `warning`, `destructive`, and `outline`
3. THE Wrapper_Component for Badge SHALL support sizes: `sm` and `md`
4. WHEN no `variant` is provided, THE Wrapper_Component for Badge SHALL default to `default`
5. THE Wrapper_Component for Badge SHALL import the Base_Component from `@/lib/shadcn/` and not expose shadcn internals to the Consumer

### Requirement 8: Tabs Wrapper Component

**User Story:** As a developer, I want a Tabs wrapper with a declarative API, so that I can build tabbed interfaces without managing internal state manually.

#### Acceptance Criteria

1. THE Wrapper_Component for Tabs SHALL accept props: `tabs` (array of tab definitions), `defaultValue`, `value`, `onValueChange`, and `className`
2. WHEN `tabs` is provided, THE Wrapper_Component for Tabs SHALL render a tab trigger for each item and display the content of the active tab
3. THE Wrapper_Component for Tabs SHALL support both controlled mode (via `value` + `onValueChange`) and uncontrolled mode (via `defaultValue`)
4. THE Wrapper_Component for Tabs SHALL associate each tab panel with its trigger via `aria-labelledby` and `aria-controls`
5. WHEN the user navigates tabs with arrow keys, THE Wrapper_Component for Tabs SHALL move focus between tab triggers following WAI-ARIA Tabs pattern
6. THE Wrapper_Component for Tabs SHALL import the Base_Component from `@/lib/shadcn/` and not expose shadcn internals to the Consumer

### Requirement 9: Table Wrapper Component

**User Story:** As a developer, I want a Table wrapper with typed column definitions, so that I can render data tables with consistent styling and row interaction support.

#### Acceptance Criteria

1. THE Wrapper_Component for Table SHALL accept props: `columns`, `data`, `onRowClick`, `emptyMessage`, and `className`
2. THE Wrapper_Component for Table SHALL render column headers from the `columns` definition array
3. WHEN `data` is empty, THE Wrapper_Component for Table SHALL display the `emptyMessage` text in a centered placeholder
4. WHEN `onRowClick` is provided, THE Wrapper_Component for Table SHALL make rows interactive with `cursor-pointer`, keyboard activation (Enter/Space), and appropriate ARIA roles
5. THE Wrapper_Component for Table SHALL support custom cell rendering via a `render` function in the column definition
6. THE Wrapper_Component for Table SHALL import the Base_Component from `@/lib/shadcn/` and not expose shadcn internals to the Consumer

### Requirement 10: Form Field Wrapper Component

**User Story:** As a developer, I want a FormField wrapper that composes label, input, and error display, so that I can build accessible forms with minimal boilerplate.

#### Acceptance Criteria

1. THE Wrapper_Component for FormField SHALL accept props: `label`, `error`, `children`, `htmlFor`, and `description`
2. WHEN `error` is provided, THE Wrapper_Component for FormField SHALL display the error text with `role="alert"` and destructive styling
3. WHEN `description` is provided, THE Wrapper_Component for FormField SHALL display help text below the label
4. THE Wrapper_Component for FormField SHALL link the error message to the child input via `aria-describedby` using a deterministic ID pattern
5. THE Wrapper_Component for FormField SHALL import the Base_Component from `@/lib/shadcn/` and not expose shadcn internals to the Consumer

### Requirement 11: Architecture Isolation

**User Story:** As a developer, I want shadcn/ui to be completely isolated from application code, so that I can replace or upgrade the underlying component library without modifying feature code.

#### Acceptance Criteria

1. THE Design_System SHALL enforce that Base_Components in `src/lib/shadcn/` are only imported by Wrapper_Components in `src/components/ui/`
2. THE Design_System SHALL ensure that no Consumer imports directly from `src/lib/shadcn/`
3. WHEN a new Base_Component is added via shadcn/ui CLI, THE Design_System SHALL require a corresponding Wrapper_Component before the Base_Component can be used in the application
4. THE Wrapper_Components SHALL re-export their own props interfaces, independent of shadcn/ui internal types
5. THE Design_System SHALL provide a barrel export at `@/components/ui` level for convenient Consumer imports

### Requirement 12: Dark Mode and Theming Support

**User Story:** As a developer, I want all wrapper components to automatically support dark and light themes, so that the design system works seamlessly with the existing theme toggle.

#### Acceptance Criteria

1. THE Wrapper_Components SHALL render correctly in both `light` and `dark` CSS class themes without additional Consumer configuration
2. THE Variant_Config SHALL use CSS custom property references (via Tailwind tokens) instead of hardcoded color values
3. WHEN the theme class changes on the document root, THE Wrapper_Components SHALL update their visual appearance via CSS custom properties without re-rendering
4. THE Token_System SHALL document which CSS custom properties each token maps to

### Requirement 13: Accessibility Compliance

**User Story:** As a developer, I want all wrapper components to meet WCAG AA accessibility standards, so that the application is usable by people with disabilities.

#### Acceptance Criteria

1. THE Wrapper_Components SHALL maintain WCAG AA color contrast ratio (4.5:1 for normal text, 3:1 for large text) in both light and dark themes
2. THE Wrapper_Components SHALL include appropriate ARIA attributes (roles, labels, states) as documented in WAI-ARIA Authoring Practices
3. WHEN a Wrapper_Component is interactive, THE Wrapper_Component SHALL be fully operable via keyboard without requiring a mouse
4. THE Wrapper_Components SHALL expose a visible focus indicator that meets WCAG 2.4.7 requirements
5. WHEN a Wrapper_Component displays dynamic status information, THE Wrapper_Component SHALL use appropriate ARIA live regions to announce changes to assistive technology

### Requirement 14: Extension and Composition Utilities

**User Story:** As a developer, I want utility functions for class merging and conditional styling, so that I can extend wrapper components without style conflicts.

#### Acceptance Criteria

1. THE Design_System SHALL export a `cn()` utility function from `@/design-system/utils/` that merges Tailwind CSS classes with conflict resolution
2. WHEN duplicate Tailwind utility classes are passed to `cn()`, THE utility SHALL keep only the last occurrence (last-wins strategy)
3. THE Design_System SHALL export a `cva()` helper or equivalent from `@/design-system/utils/` for defining component variant APIs declaratively
4. THE `cn()` utility SHALL accept conditional class expressions (falsy values are filtered out)
