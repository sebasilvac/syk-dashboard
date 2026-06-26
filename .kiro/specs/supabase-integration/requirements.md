# Requirements Document — Supabase Integration

## Introduction

Integración directa de Supabase como backend del dashboard syk-dashboard, eliminando la necesidad de una API intermedia. El objetivo es obtener máximo rendimiento conectando el frontend React directamente a Supabase para autenticación, persistencia de datos, autorización por roles y actualizaciones en tiempo real.

## Glossary

- **Supabase_Client**: Instancia singleton del SDK `@supabase/supabase-js` configurada con la URL del proyecto y la clave anónima pública.
- **Auth_Service**: Módulo de autenticación basado en Supabase Auth que gestiona sesiones, tokens y estado del usuario.
- **RLS_Policy**: Regla de Row Level Security definida en PostgreSQL que controla el acceso a filas según el rol y el ID del usuario autenticado.
- **Realtime_Channel**: Canal de suscripción de Supabase Realtime que emite cambios de datos en tiempo real a los clientes conectados.
- **Query_Layer**: Capa de abstracción que encapsula las consultas a Supabase y expone funciones tipadas para cada operación CRUD.
- **Optimistic_Update**: Patrón de actualización de la UI que aplica el cambio localmente antes de recibir la confirmación del servidor.
- **Database_Schema**: Estructura de tablas PostgreSQL en Supabase que refleja los modelos de dominio de la aplicación (clients, products, variants, quotations, orders, deposits).
- **Type_Generator**: Herramienta CLI de Supabase que genera tipos TypeScript a partir del esquema de la base de datos.
- **Session_Manager**: Componente que mantiene la sesión activa del usuario, refresca tokens y sincroniza el estado de autenticación con React.
- **Admin**: Usuario con rol `admin` que tiene acceso completo a todos los datos y operaciones.
- **Vendedor**: Usuario con rol `vendedor` que solo puede acceder a sus propios datos (cotizaciones, pedidos asignados).

## Requirements

### Requirement 1: Supabase Client Configuration

**User Story:** Como desarrollador, quiero una configuración centralizada del cliente Supabase, para que todas las consultas usen una instancia única y optimizada.

#### Acceptance Criteria

1. THE Supabase_Client SHALL be initialized as a singleton using environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
2. WHEN `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` are missing, THE Supabase_Client SHALL throw an error during initialization with a descriptive message indicating the missing variable
3. THE Supabase_Client SHALL configure `persistSession: true` and `autoRefreshToken: true` for session management
4. THE Supabase_Client SHALL be exported as a named export from `src/lib/supabase.ts`

---

### Requirement 2: Authentication with Supabase Auth

**User Story:** Como usuario, quiero autenticarme con email y contraseña a través de Supabase Auth, para que mis credenciales sean manejadas de forma segura sin un servidor intermedio.

#### Acceptance Criteria

1. WHEN a user submits valid email and password credentials, THE Auth_Service SHALL authenticate the user via `supabase.auth.signInWithPassword` and establish a session
2. WHEN authentication succeeds, THE Auth_Service SHALL store the user role from the `user_metadata.role` field and expose it via the auth context
3. WHEN a user requests logout, THE Auth_Service SHALL call `supabase.auth.signOut` and clear the local session state
4. IF authentication fails due to invalid credentials, THEN THE Auth_Service SHALL return a localized error message without revealing whether the email or password is incorrect
5. THE Session_Manager SHALL listen to `onAuthStateChange` events and synchronize the React auth state on `SIGNED_IN`, `SIGNED_OUT`, and `TOKEN_REFRESHED` events
6. WHILE the session token is within 60 seconds of expiration, THE Session_Manager SHALL automatically refresh the token using Supabase's built-in refresh mechanism

---

### Requirement 3: Database Schema Design

**User Story:** Como desarrollador, quiero un esquema de base de datos PostgreSQL en Supabase que refleje los modelos actuales, para que la migración desde datos mock sea directa.

#### Acceptance Criteria

1. THE Database_Schema SHALL define tables `clients`, `products`, `variants`, `quotations`, `quotation_lines`, `orders`, `order_lines`, and `deposits` matching the existing TypeScript model structure
2. THE Database_Schema SHALL use UUID as primary key type for all tables
3. THE Database_Schema SHALL define foreign key constraints: `variants.product_id` → `products.id`, `quotation_lines.quotation_id` → `quotations.id`, `order_lines.order_id` → `orders.id`, `deposits.order_id` → `orders.id`
4. THE Database_Schema SHALL include `created_at` and `updated_at` timestamp columns with default values on all tables that track temporal data
5. THE Database_Schema SHALL define `seller_id` columns as foreign keys referencing `auth.users(id)` on both `quotations` and `orders` tables
6. THE Database_Schema SHALL use PostgreSQL `CHECK` constraints to validate enum-like fields: `quotation_status` in (`borrador`, `pendiente`, `aprobada`, `rechazada`) and `order_status` in (`activo`, `entregado`)
7. THE Database_Schema SHALL define indexes on `quotations.seller_id`, `orders.seller_id`, `quotations.client_id`, `orders.client_id`, and `variants.product_id` for query performance

---

### Requirement 4: Row Level Security Policies

**User Story:** Como administrador del sistema, quiero que los datos estén protegidos mediante RLS, para que cada vendedor solo acceda a sus propios registros y los administradores accedan a todo.

#### Acceptance Criteria

1. THE Database_Schema SHALL enable Row Level Security on all application tables
2. WHILE a user has the `admin` role, THE RLS_Policy SHALL grant full SELECT, INSERT, UPDATE, and DELETE access on all tables
3. WHILE a user has the `vendedor` role, THE RLS_Policy SHALL grant SELECT access on `quotations` and `orders` only for rows where `seller_id` matches `auth.uid()`
4. WHILE a user has the `vendedor` role, THE RLS_Policy SHALL grant INSERT access on `quotations` and `orders` only when `seller_id` equals `auth.uid()`
5. WHILE a user has the `vendedor` role, THE RLS_Policy SHALL grant UPDATE access on `quotations` and `orders` only for rows where `seller_id` matches `auth.uid()`
6. THE RLS_Policy SHALL grant SELECT access on `clients` and `products` tables to all authenticated users regardless of role
7. THE RLS_Policy SHALL grant INSERT and UPDATE access on `clients` to all authenticated users
8. WHILE a user has the `vendedor` role, THE RLS_Policy SHALL deny DELETE access on `clients`
9. THE RLS_Policy SHALL use a `get_user_role()` PostgreSQL function that reads the role from `auth.users.raw_user_meta_data->>'role'`

---

### Requirement 5: Query Layer for Data Operations

**User Story:** Como desarrollador, quiero una capa de consultas tipada que encapsule las operaciones CRUD sobre Supabase, para que los componentes no dependan directamente del SDK.

#### Acceptance Criteria

1. THE Query_Layer SHALL expose typed async functions for each data operation: `getClients`, `createClient`, `updateClient`, `deleteClient`, `getProducts`, `getQuotations`, `createQuotation`, `updateQuotation`, `approveQuotation`, `rejectQuotation`, `getOrders`, `createOrder`, `createOrderFromQuotation`, `markOrderDelivered`, `addDeposit`, `removeDeposit`, `updateVariantStock`, `addVariant`
2. WHEN a query function is called, THE Query_Layer SHALL validate the Supabase response and throw a typed error if `error` is not null
3. THE Query_Layer SHALL return typed results matching the application's TypeScript model interfaces
4. WHEN fetching quotations or orders, THE Query_Layer SHALL use Supabase `.select()` with explicit column selection and nested relations (e.g., `quotation_lines(*)`) to minimize payload size
5. THE Query_Layer SHALL implement pagination parameters (`page`, `pageSize`) on list queries with a default page size of 50

---

### Requirement 6: React Data Hooks

**User Story:** Como desarrollador, quiero hooks de React que gestionen el fetching, caching y mutación de datos, para que los componentes consuman datos de Supabase de forma declarativa.

#### Acceptance Criteria

1. THE Query_Layer SHALL provide custom hooks (`useClients`, `useProducts`, `useQuotations`, `useOrders`) that encapsulate data fetching with loading and error states
2. WHEN a mutation hook is called (e.g., `useCreateClient`), THE Query_Layer SHALL apply an Optimistic_Update to the local state before the server confirms the operation
3. IF a mutation fails after an Optimistic_Update, THEN THE Query_Layer SHALL revert the local state to its previous value and surface the error to the component
4. WHEN a mutation succeeds, THE Query_Layer SHALL update the local cache to reflect the server-confirmed data
5. THE Query_Layer SHALL deduplicate concurrent identical requests to avoid redundant network calls

---

### Requirement 7: Real-time Subscriptions

**User Story:** Como usuario, quiero ver los cambios de otros usuarios en tiempo real sin recargar la página, para tener información siempre actualizada.

#### Acceptance Criteria

1. WHEN a data hook is mounted, THE Realtime_Channel SHALL subscribe to PostgreSQL changes on the corresponding table using Supabase Realtime
2. WHEN an INSERT event is received on a subscribed table, THE Realtime_Channel SHALL add the new record to the local state
3. WHEN an UPDATE event is received on a subscribed table, THE Realtime_Channel SHALL merge the updated fields into the corresponding local record
4. WHEN a DELETE event is received on a subscribed table, THE Realtime_Channel SHALL remove the record from the local state
5. WHEN the component using the hook unmounts, THE Realtime_Channel SHALL unsubscribe from the channel to free resources
6. IF the Realtime_Channel connection drops, THEN THE Realtime_Channel SHALL attempt automatic reconnection with exponential backoff up to 3 retries

---

### Requirement 8: Type Generation from Schema

**User Story:** Como desarrollador, quiero tipos TypeScript generados automáticamente desde el esquema de Supabase, para garantizar type-safety entre frontend y base de datos.

#### Acceptance Criteria

1. THE Type_Generator SHALL produce a TypeScript definitions file at `src/types/database.ts` using the Supabase CLI command `supabase gen types typescript`
2. THE Type_Generator SHALL be invocable via an npm script `pnpm db:types`
3. WHEN the database schema changes, THE Type_Generator SHALL regenerate types that reflect the updated column types, nullable fields, and relationships
4. THE Query_Layer SHALL use the generated database types for all Supabase query inputs and outputs to ensure compile-time type safety

---

### Requirement 9: Environment and Configuration

**User Story:** Como desarrollador, quiero una configuración de entorno clara y documentada, para que el equipo pueda conectar a Supabase sin fricción.

#### Acceptance Criteria

1. THE Application SHALL require the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for operation
2. THE Application SHALL include `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as entries in `.env.example` with placeholder descriptions
3. THE Application SHALL remove the unused `VITE_API_URL` variable from `.env.example`
4. IF `VITE_SUPABASE_URL` does not match the pattern `https://*.supabase.co`, THEN THE Supabase_Client SHALL log a warning indicating a potentially invalid Supabase URL

---

### Requirement 10: Migration Strategy from Mock Data

**User Story:** Como desarrollador, quiero una estrategia de migración clara, para que el cambio de datos mock a Supabase sea gradual y no rompa funcionalidad existente.

#### Acceptance Criteria

1. THE Application SHALL provide a SQL seed script that inserts equivalent data from the current `mockData.ts` into the Supabase database
2. WHEN `VITE_SUPABASE_URL` is not configured, THE Application SHALL fall back to the existing in-memory DataContext using mock data for local development
3. THE Application SHALL maintain the existing `DataContext` interface contract so that components are not aware of whether data comes from Supabase or mock
4. THE Application SHALL provide a `DataProvider` component that internally selects between Supabase-backed and mock-backed implementations based on environment configuration

---

### Requirement 11: Performance Optimization

**User Story:** Como usuario, quiero que el dashboard cargue rápidamente y responda con baja latencia, para una experiencia fluida sin API intermedia.

#### Acceptance Criteria

1. WHEN fetching list data, THE Query_Layer SHALL request only the columns needed by the view (explicit `.select()` projections)
2. WHEN fetching related data, THE Query_Layer SHALL use Supabase's embedded relations (joins via `.select('*, relation(*)')`) instead of multiple sequential requests
3. THE Query_Layer SHALL implement request deduplication so that multiple components requesting the same data within 100ms result in a single network request
4. WHEN a user navigates between pages, THE Application SHALL preserve cached data and avoid re-fetching unless data is older than 30 seconds
5. THE Database_Schema SHALL define appropriate indexes on all foreign key columns and frequently filtered columns to support query performance under load
