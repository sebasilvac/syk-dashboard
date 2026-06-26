---
inclusion: always
---

# Project Conventions — syk-dashboard

## Stack
- React 19 + TypeScript 6 + Vite 8
- React Compiler (babel-plugin-react-compiler) — no manual memo needed
- TailwindCSS v4 with custom theme tokens (`tailwind.config.ts`)
- PostCSS + Autoprefixer
- Inter font via `@fontsource/inter`
- PWA (vite-plugin-pwa + Workbox) — offline support, installable

## Folder Structure
```
src/
├── assets/        # Static images, SVGs
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utilities, API clients, constants
├── pages/         # Route-level page components
├── types/         # Shared TypeScript types/interfaces
├── globals.css    # Tailwind base + custom layers
├── App.tsx        # Root app component
├── main.tsx       # Entry point
└── vite-env.d.ts  # Vite env type declarations
```

## Path Aliases
Use `@/` to import from `src/`. Example: `import { Button } from '@/components/Button'`

## Styling
- Use TailwindCSS utility classes directly in JSX — no co-located `.css` files
- Dark theme palette defined in `tailwind.config.ts` (bg-primary, bg-secondary, surface, secondary, text-muted, accent-soft, highlight, accent)
- Semantic status colors: success, warning, destructive (each with DEFAULT + muted variant)
- Custom shadows: soft, elevated, glow
- Custom border-radius: xl (12px), 2xl (16px)
- Global base styles in `src/globals.css` (font smoothing, focus-visible ring, sr-only)
- Use variant/size class maps (Record objects) to keep Tailwind classes organized per component
- Maintain WCAG AA contrast: ≥ 4.5:1 normal text, ≥ 3:1 large text

## Coding Standards
- Prefer named exports over default exports (except pages for lazy loading)
- Use `function` declarations for components, not arrow functions
- Keep components small and focused — extract logic into custom hooks
- Use TypeScript strict mode — avoid `any`, prefer explicit types
- Component APIs (props interfaces) should be exported alongside the component

## Performance Rules (from Vite + React best practices)
- Use `React.lazy()` + `Suspense` for route-level code splitting
- Use `Promise.all()` for independent async operations
- Never import from barrel files — import directly from module files
- Prefer `useRef` for values that don't need to trigger re-renders
- Derive state during render instead of using effects

## Environment Variables
- All client-exposed vars must use `VITE_` prefix
- Never expose secrets (API keys, tokens) in client code
- Use `.env.example` as the template for required variables

## Testing
- Vitest as test runner (`pnpm test` runs `vitest --run`)
- Property-based testing with fast-check for logic correctness
- @testing-library/react for component unit tests
- Test files co-located: `Component.test.tsx` or `module.property.test.ts`

## Build
- `pnpm dev` — development server (port 3000)
- `pnpm build` — type-check + production build
- `pnpm lint` — ESLint check
- `pnpm test` — run all tests (vitest --run)
- `pnpm preview` — preview production build
