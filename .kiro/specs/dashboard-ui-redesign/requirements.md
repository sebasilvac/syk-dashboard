# Requirements Document

## Introduction

Complete UI/UX redesign of the SYK Dashboard application, transforming it from a light-themed vanilla CSS design into a modern, dark-themed SaaS-grade interface using TailwindCSS. The redesign focuses on visual hierarchy, consistency, readability, visual feedback, and fluid interaction while preserving existing component logic and application structure. The visual style draws inspiration from Stripe, Notion, Linear, and Vercel with a "glass + soft UI" aesthetic.

## Glossary

- **Design_System**: The unified set of design tokens, color palette, typography, spacing, and component styles that define the visual language of the SYK Dashboard
- **Sidebar**: The primary navigation component providing collapsible access to all application sections
- **Dashboard_Page**: The main overview page displaying KPI metric cards and active alerts
- **MetricCard**: A card component displaying a single key performance indicator with icon, title, and numeric value
- **DataTable**: A generic table component supporting column definitions, row click actions, and empty states
- **AppLayout**: The root layout component composing Sidebar, TopBar, and main content area
- **TopBar**: The horizontal header bar containing menu toggle and primary actions
- **Tailwind_Config**: The TailwindCSS configuration file defining custom theme tokens (colors, fonts, spacing, border-radius)
- **Loading_Skeleton**: A placeholder animation component shown while content loads
- **Microinteraction**: A subtle animation or transition providing visual feedback on user actions (hover, focus, click)
- **Color_Palette**: The mandatory set of 8 colors defining the dark UI theme (#0B2239, #193A59, #2A4058, #4D6A8A, #8FA6BD, #D1AFC0, #E7C7D2, #C084A0)
- **Focus_Ring**: A visible outline indicator shown when an interactive element receives keyboard focus
- **Responsive_Layout**: A layout system adapting to mobile (375px), tablet (768px), and desktop (1440px) viewports

## Requirements

### Requirement 1: TailwindCSS Integration and Design Token Configuration

**User Story:** As a developer, I want the project to use TailwindCSS with a custom theme configuration matching the mandatory color palette, so that all components share a consistent design language and styling is scalable.

#### Acceptance Criteria

1. THE Tailwind_Config SHALL define the Color_Palette as custom theme colors with semantic aliases (background-primary: #0B2239, background-secondary: #193A59, surface: #2A4058, secondary: #4D6A8A, text-muted: #8FA6BD, accent-soft: #D1AFC0, highlight: #E7C7D2, accent: #C084A0)
2. THE Tailwind_Config SHALL define the typography scale using Inter or Poppins as the primary font family with fallback to system sans-serif
3. THE Tailwind_Config SHALL define custom border-radius tokens including a `2xl` value of 16px and an `xl` value of 12px
4. THE Tailwind_Config SHALL define custom box-shadow tokens for soft elevation (shadow-soft, shadow-elevated, shadow-glow)
5. WHEN a component is styled, THE Design_System SHALL use Tailwind utility classes instead of vanilla CSS class selectors
6. THE Design_System SHALL remove all co-located `.css` files once their corresponding component has been migrated to Tailwind utility classes

### Requirement 2: Dark Theme Global Styling

**User Story:** As a user, I want the application to present a cohesive dark UI with high contrast text, so that I can work comfortably and read content clearly.

#### Acceptance Criteria

1. THE Design_System SHALL apply #0B2239 as the root background color for the application body
2. THE Design_System SHALL use white (#FFFFFF) or near-white (#F1F5F9) text for primary content to maintain a minimum contrast ratio of 4.5:1 against the background
3. THE Design_System SHALL use #8FA6BD for secondary and muted text elements
4. THE Design_System SHALL use colors from the Color_Palette exclusively for accent highlights (#C084A0) on interactive elements such as buttons, links, and active states
5. THE Design_System SHALL apply subtle gradients or glass-effect overlays only on card surfaces and never on text elements
6. WHILE the user views any page, THE Design_System SHALL maintain consistent dark theming across all pages without light-mode flashes

### Requirement 3: Responsive Layout System

**User Story:** As a user, I want the dashboard to adapt seamlessly across mobile, tablet, and desktop devices, so that I can manage orders and inventory from any device.

#### Acceptance Criteria

1. THE Responsive_Layout SHALL use a mobile-first approach where base styles target viewports of 375px width
2. WHEN the viewport width reaches 768px, THE Responsive_Layout SHALL transition to a tablet layout with the Sidebar collapsed by default and content using a two-column grid where appropriate
3. WHEN the viewport width reaches 1024px, THE Responsive_Layout SHALL display the Sidebar expanded by default alongside the main content area
4. WHEN the viewport width reaches 1440px, THE Responsive_Layout SHALL limit the main content area to a maximum width of 1280px centered within available space
5. THE AppLayout SHALL use CSS Grid or Flexbox via Tailwind utilities to compose Sidebar, TopBar, and content regions without fixed pixel widths on the main content

### Requirement 4: Sidebar Navigation Redesign

**User Story:** As a user, I want an elegant collapsible sidebar with clear navigation icons and labels, so that I can quickly access any section of the application.

#### Acceptance Criteria

1. THE Sidebar SHALL display navigation items with an icon and a text label when expanded
2. WHEN the Sidebar is collapsed, THE Sidebar SHALL display only icons with tooltip labels on hover
3. THE Sidebar SHALL apply a background color of #193A59 with items using #2A4058 on hover
4. WHEN a navigation item is active, THE Sidebar SHALL highlight the item using the accent color (#C084A0) as a left border or background tint
5. THE Sidebar SHALL include a toggle button that collapses and expands the sidebar with a smooth width transition of 200ms
6. WHEN the viewport is below 768px, THE Sidebar SHALL render as an overlay drawer that slides in from the left
7. THE Sidebar SHALL include the application logo or brand mark at the top

### Requirement 5: TopBar Header Redesign

**User Story:** As a user, I want a clean header bar with quick access to notifications and primary actions, so that I can stay informed and act quickly.

#### Acceptance Criteria

1. THE TopBar SHALL display a hamburger menu button on mobile viewports (below 768px) that toggles the Sidebar overlay
2. THE TopBar SHALL display a search input field or placeholder on desktop viewports
3. THE TopBar SHALL include the AlertBell notification component positioned to the right
4. THE TopBar SHALL apply a background of #0B2239 with a subtle bottom border of #2A4058 for visual separation
5. THE TopBar SHALL have a fixed height and remain sticky at the top of the scrollable content area

### Requirement 6: MetricCard Component Redesign

**User Story:** As a user, I want visually rich KPI cards with clear hierarchy and subtle animation, so that I can quickly assess business health at a glance.

#### Acceptance Criteria

1. THE MetricCard SHALL apply a surface background of #2A4058 with rounded-2xl border-radius and shadow-soft elevation
2. THE MetricCard SHALL display the icon in a rounded container with a semi-transparent background tinted by the card variant color
3. THE MetricCard SHALL display the title in muted text (#8FA6BD) and the value in large white bold text
4. WHEN the user hovers over the MetricCard, THE MetricCard SHALL apply a translateY(-2px) transform and increase shadow elevation with a 200ms ease transition
5. THE MetricCard SHALL render responsively: single column on mobile, two columns on tablet, and three or four columns on desktop using Tailwind grid utilities

### Requirement 7: DataTable Component Redesign

**User Story:** As a user, I want a modern data table with clear row separation, hover states, and good readability, so that I can scan lists of orders, clients, and inventory efficiently.

#### Acceptance Criteria

1. THE DataTable SHALL apply a surface background of #2A4058 with rounded-2xl border-radius and overflow hidden
2. THE DataTable SHALL style the table header with #193A59 background and #8FA6BD uppercase text
3. WHEN the user hovers over a table row, THE DataTable SHALL apply a background color of #193A59 with a 150ms transition
4. THE DataTable SHALL use #4D6A8A as a subtle row border color with 1px horizontal separators
5. WHEN a row is clickable, THE DataTable SHALL display a pointer cursor and apply the hover background transition
6. THE DataTable SHALL display a styled empty state with an illustration placeholder and muted message when no data is available

### Requirement 8: Button Component Redesign

**User Story:** As a user, I want clearly styled buttons with visible hover, focus, and disabled states, so that I can confidently identify and interact with actionable elements.

#### Acceptance Criteria

1. THE Button SHALL apply rounded-xl border-radius with consistent horizontal and vertical padding based on the size variant (sm: px-3 py-1.5, md: px-4 py-2, lg: px-6 py-3)
2. WHEN the variant is primary, THE Button SHALL use #C084A0 as the background color with white text
3. WHEN the variant is secondary, THE Button SHALL use a transparent background with a 1px border of #4D6A8A and #8FA6BD text
4. WHEN the variant is destructive, THE Button SHALL use a red-tinted background (#7F1D1D) with light text
5. WHEN the variant is ghost, THE Button SHALL use a transparent background with #8FA6BD text that brightens on hover
6. WHEN the user hovers over a primary Button, THE Button SHALL lighten the background by 10% with a 150ms transition
7. WHEN the Button receives keyboard focus, THE Button SHALL display a Focus_Ring of 2px offset using #C084A0 color
8. WHILE the Button is disabled, THE Button SHALL reduce opacity to 0.5 and disable pointer events

### Requirement 9: Form Input Styling

**User Story:** As a user, I want clearly defined form inputs with visible focus states and error indicators, so that I can fill forms accurately and efficiently.

#### Acceptance Criteria

1. THE FormField SHALL render inputs with a #193A59 background, 1px border of #4D6A8A, rounded-xl border-radius, and white text
2. WHEN an input receives focus, THE FormField SHALL change the border color to #C084A0 with a subtle glow shadow and 150ms transition
3. IF a validation error exists, THEN THE FormField SHALL display a red border color and an error message below the input in red text
4. THE FormField SHALL display labels in #8FA6BD text positioned above the input with consistent spacing
5. THE FormField SHALL apply placeholder text in #4D6A8A color

### Requirement 10: Status Badges

**User Story:** As a user, I want color-coded status badges that are immediately recognizable, so that I can quickly understand the state of orders and quotations.

#### Acceptance Criteria

1. THE Design_System SHALL render status badges as inline pill-shaped elements with rounded-full border-radius and small padding (px-2.5 py-0.5)
2. WHEN the status represents an active or success state, THE badge SHALL use a green-tinted background with green text
3. WHEN the status represents a pending or warning state, THE badge SHALL use an amber-tinted background with amber text
4. WHEN the status represents a completed or neutral state, THE badge SHALL use a #4D6A8A background with #8FA6BD text
5. WHEN the status represents a critical or overdue state, THE badge SHALL use a red-tinted background with red text

### Requirement 11: Loading Skeletons and Empty States

**User Story:** As a user, I want visual feedback during content loading and clear messaging when no data exists, so that I understand the application state at all times.

#### Acceptance Criteria

1. WHILE content is loading, THE Loading_Skeleton SHALL display animated placeholder blocks matching the layout shape of the expected content
2. THE Loading_Skeleton SHALL use a pulse animation cycling between #2A4058 and #193A59 background colors
3. THE Loading_Skeleton SHALL match the dimensions and spacing of MetricCard, DataTable rows, and page sections
4. WHEN a list contains no items, THE EmptyState component SHALL display a centered illustration, a descriptive title, and an optional action button
5. THE EmptyState SHALL use #8FA6BD text with the accent color (#C084A0) for the action button

### Requirement 12: Microinteractions and Transitions

**User Story:** As a user, I want smooth animations and hover feedback throughout the interface, so that the application feels polished and responsive to my actions.

#### Acceptance Criteria

1. THE Design_System SHALL apply a 150ms ease transition to all interactive elements for background-color, border-color, box-shadow, and transform properties
2. WHEN the user hovers over a card or clickable surface, THE surface SHALL apply a subtle scale or translate transform with increased shadow
3. WHEN a page section loads, THE section SHALL fade in with a 200ms opacity transition from 0 to 1
4. WHEN the Sidebar opens or closes, THE Sidebar SHALL animate its width with a 200ms ease-in-out transition
5. WHEN a modal or dialog opens, THE ConfirmDialog SHALL fade in with a backdrop opacity transition of 150ms

### Requirement 13: Accessibility Compliance

**User Story:** As a user who relies on keyboard navigation or assistive technology, I want the redesigned interface to maintain full accessibility, so that I can use all features without barriers.

#### Acceptance Criteria

1. THE Design_System SHALL maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text against background surfaces
2. WHEN an interactive element receives keyboard focus, THE element SHALL display a visible Focus_Ring that is distinct from hover states
3. THE Sidebar navigation SHALL be fully operable via keyboard with arrow key navigation and Enter/Space activation
4. THE Design_System SHALL preserve all existing ARIA attributes, roles, and labels from the current component implementations
5. WHILE the Sidebar overlay is open on mobile, THE overlay SHALL trap keyboard focus within the Sidebar until dismissed
6. THE Design_System SHALL ensure all color-conveyed information also has a non-color indicator (icon, text label, or pattern)

### Requirement 14: Login Page Redesign

**User Story:** As a user, I want a visually striking login page that establishes the brand aesthetic, so that my first impression of the application is professional and trustworthy.

#### Acceptance Criteria

1. THE LoginPage SHALL display a centered card with the application logo, a title, and the login form on a full-viewport #0B2239 background
2. THE LoginPage card SHALL use a #193A59 background with rounded-2xl, shadow-elevated, and a subtle border of #2A4058
3. THE LoginPage SHALL style the submit button using the primary accent color (#C084A0)
4. WHEN a login error occurs, THE LoginPage SHALL display the error message in a styled alert with red tinting

### Requirement 15: Notification Panel Redesign

**User Story:** As a user, I want a modern notification panel that clearly shows alert severity, so that I can prioritize and act on important alerts quickly.

#### Acceptance Criteria

1. WHEN the user clicks the AlertBell, THE AlertPanel SHALL appear as a dropdown card with rounded-2xl, #2A4058 background, and shadow-elevated
2. THE AlertPanel SHALL display each alert with a severity indicator (colored dot or icon), message text, and a timestamp
3. WHEN an alert has critical severity, THE AlertPanel SHALL highlight the alert row with a red-tinted left border
4. WHEN an alert has warning severity, THE AlertPanel SHALL highlight the alert row with an amber-tinted left border
5. THE AlertPanel SHALL include a "Mark all read" action styled as a ghost button at the panel header
