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
├── components/    # Componentes UI reutilizables
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

- **Path alias**: usar `@/` para importar desde `src/`. Ejemplo: `import { Button } from '@/components/Button'`
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

## Consideraciones para Agentes

1. **Antes de modificar código**, leer los archivos relevantes y entender el patrón existente
2. **Respetar la arquitectura**: queries en `src/lib/queries/`, hooks en `src/hooks/`, validaciones en `src/lib/`, tipos en `src/types/`
3. **No agregar dependencias** sin justificación clara
4. **Ejecutar `pnpm build`** después de cambios para verificar que compila
5. **Ejecutar `pnpm test`** si se modifica lógica cubierta por tests
6. **Idioma del código**: variables y tipos en inglés, UI y mensajes al usuario en español
7. **No usar `any`**: TypeScript strict mode está activo con reglas estrictas
8. **Dark mode**: todos los componentes deben soportar el tema oscuro
9. **Imports**: usar siempre `@/` alias, nunca rutas relativas con `../`
10. **Nuevas páginas**: deben usar `export default` y cargarse con `React.lazy()` en App.tsx
11. **Nuevas acciones de estado**: agregar tipo en `src/types/actions.ts` y handler en `src/lib/dataReducer.ts`
12. **Migraciones SQL**: numerar secuencialmente (siguiente: `006_*.sql`)
