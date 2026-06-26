# AGENTS.md — syk-dashboard

## Descripción del Proyecto

SYK Dashboard es una aplicación web PWA tipo backoffice para gestión de cotizaciones, pedidos, inventario y clientes. Está diseñada para uso interno multiusuario con roles (`admin` y `vendedor`).

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript 6 + Vite 8 |
| Routing | react-router-dom v7 (lazy loading por ruta) |
| Estilos | TailwindCSS v4 (theme tokens en `tailwind.config.ts`) |
| Estado | Context API + useReducer (sin Redux) |
| Backend | Supabase (Auth + PostgreSQL + Realtime + RLS) |
| PWA | vite-plugin-pwa + Workbox |
| Testing | Vitest 4 + fast-check (property-based) + @testing-library/react |
| Linting | ESLint 10 (flat config) + typescript-eslint + react-hooks + react-refresh |
| Optimización | React Compiler (babel-plugin-react-compiler via @rolldown/plugin-babel) |

## Estructura del Proyecto

```
src/
├── assets/        # Imágenes y SVGs estáticos
├── components/    # Componentes de negocio reutilizables (StatusBadge, ConfirmDialog, etc.)
├── design-system/ # 🎨 Design System autocontenido (ver sección dedicada abajo)
│   ├── primitives/  # Componentes HTML base (uso interno exclusivo)
│   ├── components/  # Wrappers con API pública (Button, Input, Card, Modal, etc.)
│   ├── tokens/      # Valores de diseño (spacing, typography, radius, shadows, zIndex)
│   ├── variants/    # Configuraciones de variantes por componente (cva)
│   ├── utils/       # Utilidades (cn, cva)
│   ├── index.ts     # Barrel export principal
│   └── README.md    # Documentación de uso e instalación
├── hooks/         # Custom hooks (useAuth, useClients, useOrders, useProducts, useQuotations, useDataScope)
├── lib/           # Utilidades, contextos, queries Supabase, validaciones
│   ├── queries/   # Funciones de consulta a Supabase por entidad (clients, orders, products, quotations, shared)
│   └── realtime/  # Suscripciones en tiempo real (channels, useRealtimeSubscription)
├── pages/         # Componentes a nivel de ruta (lazy-loaded, default exports)
├── types/         # Tipos TypeScript compartidos (models, actions, auth, database)
├── globals.css    # Estilos base Tailwind + capas custom
├── App.tsx        # Componente raíz con rutas
├── main.tsx       # Entry point
└── test-setup.ts  # Setup global de Vitest

supabase/
├── migrations/    # Migraciones SQL (schema + RLS policies), numeradas 001..005
├── config.toml    # Configuración local de Supabase
└── seed.sql       # Datos de prueba
```

## Comandos Principales

```bash
pnpm dev          # Servidor de desarrollo (puerto 3000)
pnpm build        # Type-check (tsc -b) + build producción
pnpm lint         # ESLint (flat config)
pnpm test         # Vitest (--run, sin watch)
pnpm test:watch   # Vitest en modo watch
pnpm preview      # Preview del build de producción
pnpm db:types     # Generar tipos TS desde Supabase (requiere SUPABASE_PROJECT_ID)
```

## Convenciones de Código

- **Path alias**: usar `@/` para importar desde `src/`. Ejemplo: `import { Button } from '@/design-system/components/Button'`
- **Exports**: preferir named exports. Default exports solo para páginas (lazy loading)
- **Componentes**: declarar con `function`, no arrow functions. Props interface exportada junto al componente
- **TypeScript**: modo strict, sin `any`, tipos explícitos. `noUncheckedIndexedAccess` habilitado, `verbatimModuleSyntax` activo
- **Estilos**: clases Tailwind directamente en JSX. Sin archivos `.css` co-ubicados. Usar mapas Record para variantes
- **Performance**: `React.lazy()` + `Suspense` para rutas. No importar desde barrel files. Derivar estado en render
- **Accesibilidad**: mantener contraste WCAG AA (≥4.5:1 texto normal, ≥3:1 texto grande)
- **Dark mode**: estrategia `class` en TailwindCSS. Todos los componentes deben soportar tema oscuro

## Modelo de Datos

### Tablas en PostgreSQL

| Tabla | Descripción |
|-------|-------------|
| `clients` | Clientes (name, email, phone) |
| `products` | Productos (name, category) |
| `variants` | Variantes de producto (size, color, stock, min_stock) → FK a `products` |
| `quotations` | Cotizaciones (number, client_id, seller_id, total, status, notes, estimated_delivery_date) |
| `quotation_lines` | Líneas de cotización (product_id, variant_id, quantity, unit_price, subtotal) → FK a `quotations` |
| `orders` | Pedidos (number, client_id, seller_id, total, status, notes, due_date, quotation_id) |
| `order_lines` | Líneas de pedido (product_id, variant_id, quantity, unit_price, subtotal) → FK a `orders` |
| `deposits` | Depósitos/pagos parciales (order_id, amount, method, date) → FK a `orders` |

### Tipos frontend (src/types/models.ts)

- **Client**: id, name, email, phone
- **Product**: id, name, category, variants[]
- **Variant**: id, size, color, stock, minStock
- **Quotation**: id, number, clientId, sellerId, lines[], total, status, notes, estimatedDeliveryDate?, createdAt, updatedAt
- **ProductLine**: id, productId, variantId, quantity, unitPrice, subtotal
- **Order**: id, number, clientId, sellerId, lines[], total, status, notes, dueDate, quotationId?, deposits[], createdAt, updatedAt
- **Deposit**: id, amount, method, date

### Enums

- **QuotationStatus**: `pendiente` | `aprobada` | `rechazada`
- **OrderStatus**: `activo` | `entregado`
- **PaymentMethod**: `transferencia` | `efectivo`
- **AlertSeverity**: `warning` | `critical`
- **AlertType**: `due_soon` | `overdue` | `low_stock`
- **Role**: `admin` | `vendedor`

### Flujos de negocio

```
Cotización (pendiente) → Aprobar → Pedido (activo) → Entregar
                 ↓                         ↓
             Rechazar              Consumir inventario

Flujo rápido: Pedido directo (sin cotización previa)
```

## Estado Global (Context + useReducer)

Las acciones del reducer están definidas en `src/types/actions.ts`:

- `QUOTATION_CREATE`, `QUOTATION_UPDATE`, `QUOTATION_APPROVE`, `QUOTATION_REJECT`
- `ORDER_CREATE`, `ORDER_CREATE_FROM_QUOTATION`, `ORDER_MARK_DELIVERED`
- `PRODUCT_CREATE`, `PRODUCT_DELETE`
- `VARIANT_ADD`, `VARIANT_UPDATE_STOCK`, `VARIANT_DELETE`
- `STOCK_DEDUCT`
- `CLIENT_CREATE`, `CLIENT_UPDATE`, `CLIENT_DELETE`
- `DEPOSIT_ADD`, `DEPOSIT_REMOVE`

Contextos principales:
- `DataContext` / `DataProvider` — estado de entidades + dispatch
- `AuthContext` / `SupabaseAuthContext` — autenticación
- `AlertContext` / `AlertProvider` — alertas computadas
- `ThemeContext` / `ThemeProvider` — modo claro/oscuro

## Autenticación y Autorización

- Supabase Auth con JWT
- Roles: `admin` (acceso total) y `vendedor` (scoped por `seller_id`)
- RLS (Row Level Security) activo en todas las tablas
- El rol se lee de `user_metadata.role` en el JWT
- Frontend: `<ProtectedRoute>` para rutas autenticadas, `<RoleGate>` para control por rol
- Hook `useAuth` expone state (user, isAuthenticated, loading), login, logout
- Hook `useDataScope` filtra datos según el rol del usuario

## Rutas de la Aplicación

| Ruta | Página | Acceso |
|------|--------|--------|
| `/` | RootRedirect | Redirige a /dashboard o /login |
| `/login` | LoginPage | Público |
| `/acceso-denegado` | AccessDeniedPage | Público |
| `/dashboard` | DashboardPage | Autenticado |
| `/cotizaciones` | QuotationListPage | Autenticado |
| `/cotizaciones/nueva` | QuotationFormPage | Autenticado |
| `/cotizaciones/:id` | QuotationDetailPage | Autenticado |
| `/pedidos` | OrderListPage | Autenticado |
| `/pedidos/nuevo` | OrderFormPage | Autenticado |
| `/pedidos/:id` | OrderDetailPage | Autenticado |
| `/inventario` | InventoryListPage | Autenticado |
| `/inventario/nuevo` | ProductFormPage | Autenticado |
| `/inventario/:id` | InventoryDetailPage | Autenticado |
| `/clientes` | ClientListPage | Autenticado |
| `*` | NotFoundPage | Público (catch-all) |

## Sistema de Alertas

- **Pedido por vencer**: `dueDate - hoy <= 2 días` → severity `warning`
- **Pedido atrasado**: `hoy > dueDate` → severity `critical`
- **Stock bajo**: `stock <= minStock` → severity `warning`

Las alertas se computan en `src/lib/computeAlerts.ts` y se exponen via `AlertContext`.
Se muestran en el UI a través de `AlertBell` + `AlertPanel`.

## Variables de Entorno

```env
VITE_APP_TITLE=syk-dashboard
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

Todas las variables de cliente usan prefijo `VITE_`. No exponer secrets en el cliente.
Template en `.env.example`.

## Testing

- Tests co-ubicados: `*.test.tsx` o `*.property.test.ts`
- Property-based tests con `fast-check` para lógica pura (validaciones, filtros, cálculos, alertas)
- Component tests con `@testing-library/react` + `@testing-library/jest-dom`
- Setup global en `src/test-setup.ts`
- Entorno: jsdom
- Ejecutar: `pnpm test`

## Supabase

- Migraciones en `supabase/migrations/` (numeradas secuencialmente, 001-005)
- RLS habilitado en todas las tablas con políticas por rol
- Tipos generados con `pnpm db:types` (requiere `SUPABASE_PROJECT_ID` en env)
- Realtime subscriptions en `src/lib/realtime/`
- Config local en `supabase/config.toml`

## Build y Optimización

- Target de build: `baseline-widely-available`
- Chunk splitting manual: `vendor` chunk para react + react-dom
- `chunkSizeWarningLimit`: 500KB
- Sin sourcemaps en producción
- PWA con Workbox: cache de imágenes (CacheFirst, 30 días), API (NetworkFirst, 5 min)
- Optimización de dependencias: react y react-dom pre-bundled

## Tema y Estilos

Colores semánticos definidos via CSS custom properties:
- Layout: `bg-primary`, `bg-secondary`, `surface`, `text-primary`, `text-muted`
- Acentos: `accent`, `accent-soft`, `highlight`, `secondary`
- Status: `success` (+ muted), `warning` (+ muted), `destructive` (+ muted)

Tipografía:
- Sans: Inter (via @fontsource/inter)
- Mono: Fira Code

Sombras custom: `soft`, `elevated`, `glow`

## Design System (`src/design-system/`)

El proyecto cuenta con un **design system autocontenido** ubicado en `src/design-system/`. Todo componente UI visible debe usar exclusivamente los componentes de este sistema.

### Componentes disponibles

| Componente | Import | Uso |
|------------|--------|-----|
| `Button` | `@/design-system/components/Button` | Botones con variant/size/loading |
| `Input` | `@/design-system/components/Input` | Inputs con label, error, auto-id |
| `Select` | `@/design-system/components/Select` | Dropdown custom con keyboard nav |
| `Card` | `@/design-system/components/Card` | Contenedores con header/footer |
| `Modal` | `@/design-system/components/Modal` | Diálogos modales con focus trap |
| `Badge` | `@/design-system/components/Badge` | Indicadores de estado |
| `Tabs` | `@/design-system/components/Tabs` | Tabs con ARIA y keyboard nav |
| `Table` | `@/design-system/components/Table` | Tablas de datos tipadas |
| `FormField` | `@/design-system/components/FormField` | Wrapper label + error para forms |

### Reglas obligatorias

1. **SIEMPRE usar los componentes del design system** para UI. No crear botones, inputs, modales, selects, tablas o badges ad-hoc con HTML crudo
2. **Importar desde `@/design-system/components/`**, nunca desde `@/design-system/primitives/` (uso interno)
3. **Para utilidades de clase CSS**: usar `cn()` de `@/design-system/utils/cn` (no concatenar strings manualmente)
4. **Para variantes de componente**: usar `cva()` de `@/design-system/utils/cva` (no crear Record maps manuales)

### Crear un componente nuevo en el design system

Si se necesita un componente que **no existe**, crearlo siguiendo estos pasos:

1. **Primitivo** — Crear `src/design-system/primitives/nuevo.tsx`: componente HTML mínimo con `forwardRef` y `className` prop
2. **Variantes** — Crear `src/design-system/variants/nuevo.ts`: definir variantes con `cva()`, exportar tipos
3. **Wrapper** — Crear `src/design-system/components/Nuevo.tsx`: importar primitivo + variantes + `cn()`, exponer API limpia con props tipadas
4. **Barrel** — Agregar export en `src/design-system/components/index.ts`
5. **Barrel de variantes** — Agregar export en `src/design-system/variants/index.ts`
6. **Tests** — Crear test co-ubicado `src/design-system/components/Nuevo.test.tsx`

### Lineamientos de estilo para variantes

- Usar **solo clases Tailwind semánticas** que resuelvan via CSS custom properties (no hex hardcodeados, no `rgb()` literales)
- Incluir `defaultVariants` en cada configuración `cva()`
- Los colores de status usan: `success`, `warning`, `destructive` (cada uno con variante `-muted`)
- Focus ring: `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary`
- Border radius estándar: `rounded-xl` (componentes) o `rounded-2xl` (contenedores/cards)
- Transiciones: `transition-all duration-150`

### Documentación completa

Ver `src/design-system/README.md` para instrucciones detalladas de instalación, personalización y uso en otros proyectos.

## Consideraciones para Agentes

1. **Antes de modificar código**, leer los archivos relevantes y entender el patrón existente
2. **Usar siempre el Design System** para componentes UI: importar desde `@/design-system/components/`. Si el componente no existe, crearlo dentro de `src/design-system/` siguiendo la arquitectura (primitivo → variantes → wrapper). Ver `src/design-system/README.md` para lineamientos
3. **Respetar la arquitectura**: queries en `src/lib/queries/`, hooks en `src/hooks/`, validaciones en `src/lib/`, tipos en `src/types/`
4. **No agregar dependencias** sin justificación clara
5. **Ejecutar `pnpm build`** después de cambios para verificar que compila
6. **Ejecutar `pnpm test`** si se modifica lógica cubierta por tests
7. **Idioma del código**: variables y tipos en inglés, UI y mensajes al usuario en español
8. **No usar `any`**: TypeScript strict mode está activo con reglas estrictas
9. **Dark mode**: todos los componentes deben soportar el tema oscuro
10. **Imports**: usar siempre `@/` alias, nunca rutas relativas con `../`
11. **Nuevas páginas**: deben usar `export default` y cargarse con `React.lazy()` en App.tsx
12. **Nuevas acciones de estado**: agregar tipo en `src/types/actions.ts` y handler en `src/lib/dataReducer.ts`
13. **Migraciones SQL**: numerar secuencialmente (siguiente: `006_*.sql`)
14. **No importar desde `@/design-system/primitives/`**: son componentes internos del design system, accesibles solo desde los wrappers en `@/design-system/components/`
