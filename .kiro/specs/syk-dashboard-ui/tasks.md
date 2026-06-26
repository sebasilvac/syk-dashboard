# Plan de Implementación: SYK Dashboard UI

## Resumen

Implementación incremental del dashboard SYK como PWA con React 19, TypeScript 6 y Vite 8. El plan sigue un enfoque de capas: tipos y datos → lógica de negocio → estado global → componentes reutilizables → páginas → integración final. Cada tarea construye sobre las anteriores y termina con el cableado completo de la aplicación.

## Tareas

- [x] 1. Definir tipos compartidos y datos mock
  - [x] 1.1 Crear interfaces y tipos TypeScript en `src/types/`
    - Crear `src/types/models.ts` con todas las interfaces: `User`, `Role`, `Client`, `Product`, `Variant`, `Quotation`, `QuotationStatus`, `ProductLine`, `Order`, `OrderStatus`, `Alert`, `AlertSeverity`, `AlertType`, `AppData`
    - Crear `src/types/actions.ts` con el tipo unión `DataAction` (10 acciones del reducer)
    - Crear `src/types/auth.ts` con `AuthState` y `AuthContextValue`
    - _Requerimientos: 15.1, 15.2_

  - [x] 1.2 Crear módulo de datos mock en `src/lib/mockData.ts`
    - Exportar estado inicial con al menos 3 clientes, 5 productos con variantes, 4 cotizaciones en distintos estados, 3 pedidos en distintos estados
    - Incluir un pedido con dueDate < 2 días y uno con dueDate pasado
    - Incluir al menos un producto con stock ≤ minStock
    - _Requerimientos: 15.1, 15.4, 15.5_

- [x] 2. Implementar lógica de negocio pura en `src/lib/`
  - [x] 2.1 Crear `src/lib/calculateTotals.ts`
    - Función `calculateSubtotal(quantity, unitPrice)` → subtotal
    - Función `calculateDocumentTotal(lines)` → suma de subtotales
    - _Requerimientos: 5.3, 5.5_

  - [x] 2.2 Test de propiedad para cálculo de totales
    - **Propiedad 1: Cálculo de totales en líneas de producto**
    - **Valida: Requerimientos 5.3, 5.5**

  - [x] 2.3 Crear `src/lib/filterByStatus.ts`
    - Función genérica que filtra cotizaciones o pedidos por estado
    - _Requerimientos: 4.2, 7.4_

  - [x] 2.4 Test de propiedad para filtrado por estado
    - **Propiedad 2: Filtrado por estado retorna solo elementos coincidentes**
    - **Valida: Requerimientos 4.2, 7.4**

  - [x] 2.5 Crear `src/lib/searchFilter.ts`
    - Función que filtra por cadena de búsqueda case-insensitive sobre nombre de cliente, número de documento, nombre/categoría de producto
    - _Requerimientos: 4.3, 10.4_

  - [x] 2.6 Test de propiedad para búsqueda textual
    - **Propiedad 3: Búsqueda textual filtra correctamente**
    - **Valida: Requerimientos 4.3, 10.4**

  - [x] 2.7 Crear `src/lib/computeAlerts.ts`
    - Función `computeAlerts(data, today)` que genera alertas de pedidos por vencer, atrasados y stock bajo
    - Ordenar alertas: critical primero, warning después
    - _Requerimientos: 12.1, 12.2, 12.3, 12.5_

  - [x] 2.8 Test de propiedad para generación de alertas
    - **Propiedad 4: Generación de alertas según condiciones de negocio**
    - **Valida: Requerimientos 12.1, 12.2, 12.3**

  - [x] 2.9 Test de propiedad para ordenamiento de alertas
    - **Propiedad 5: Ordenamiento de alertas por severidad**
    - **Valida: Requerimientos 12.5**

  - [x] 2.10 Crear `src/lib/stockValidation.ts`
    - Función `deductStock(products, items)` que retorna productos con stock decrementado
    - Función `validateStockAvailability(products, lines)` que señala variantes con stock insuficiente
    - _Requerimientos: 8.3, 8.5_

  - [x] 2.11 Test de propiedad para descuento de inventario
    - **Propiedad 8: Creación de pedido descuenta inventario**
    - **Valida: Requerimientos 8.3**

  - [x] 2.12 Test de propiedad para validación de stock insuficiente
    - **Propiedad 9: Validación de stock insuficiente**
    - **Valida: Requerimientos 8.5**

  - [x] 2.13 Crear `src/lib/formValidation.ts`
    - Función `validateQuotationForm(data)` → errores si falta cliente o líneas
    - Función `validateOrderForm(data)` → errores si falta cliente, dueDate o líneas
    - _Requerimientos: 5.6, 8.4_

  - [x] 2.14 Test de propiedad para validación de formularios
    - **Propiedad 10: Validación de formularios rechaza datos incompletos**
    - **Valida: Requerimientos 5.6, 8.4**

  - [x] 2.15 Crear `src/lib/contrastCheck.ts`
    - Función `getContrastRatio(foreground, background)` que calcula relación de contraste WCAG
    - _Requerimientos: 16.5_

  - [x] 2.16 Test de propiedad para contraste WCAG
    - **Propiedad 14: Contraste de color WCAG AA**
    - **Valida: Requerimientos 16.5**

- [x] 3. Checkpoint — Verificar lógica de negocio
  - Asegurar que todos los tests pasan, consultar al usuario si surgen dudas.

- [x] 4. Implementar gestión de estado global
  - [x] 4.1 Crear reducer principal en `src/lib/dataReducer.ts`
    - Implementar los 10 casos de `DataAction`: QUOTATION_CREATE, QUOTATION_UPDATE, QUOTATION_APPROVE, QUOTATION_REJECT, ORDER_CREATE, ORDER_CREATE_FROM_QUOTATION, ORDER_MARK_DELIVERED, VARIANT_ADD, VARIANT_UPDATE_STOCK, STOCK_DEDUCT
    - Generar IDs y números secuenciales (COT-XXX, PED-XXX)
    - _Requerimientos: 5.4, 6.1, 6.3, 6.4, 8.3, 9.2, 11.1, 11.2_

  - [x] 4.2 Test de propiedad para creación de pedido desde cotización
    - **Propiedad 7: Creación de pedido desde cotización preserva líneas**
    - **Valida: Requerimientos 6.3**

  - [x] 4.3 Crear `src/hooks/useAuth.ts` y `src/lib/AuthContext.tsx`
    - Implementar AuthContext con login(role), logout y estado de sesión
    - Almacenar usuario activo con rol seleccionado
    - _Requerimientos: 1.1, 1.2, 1.3_

  - [x] 4.4 Crear `src/lib/DataContext.tsx`
    - Proveer AppData + dispatch usando useReducer con mockData como estado inicial
    - _Requerimientos: 15.2, 15.3_

  - [x] 4.5 Crear `src/lib/AlertContext.tsx`
    - Derivar alertas desde DataContext usando `computeAlerts`
    - Exponer `alerts` y `alertCount`
    - _Requerimientos: 12.1, 12.2, 12.3, 12.4_

  - [x] 4.6 Crear `src/hooks/useDataScope.ts`
    - Hook que filtra datos según rol: vendedor ve solo sus items, admin ve todo
    - _Requerimientos: 3.4, 3.5_

  - [x] 4.7 Test de propiedad para alcance de datos según rol
    - **Propiedad 12: Alcance de datos según rol**
    - **Valida: Requerimientos 3.4, 3.5**

- [x] 5. Implementar componentes reutilizables (UI Kit)
  - [x] 5.1 Crear variables CSS globales y reset en `src/index.css`
    - Definir custom properties: --color-primary, --color-accent, --color-background, --color-foreground, --color-destructive, --color-border
    - Definir tipografía (Fira Code para headings/tabular, Fira Sans para body)
    - Definir breakpoints y espaciado base
    - _Requerimientos: 16.1, 16.2, 16.4_

  - [x] 5.2 Crear `src/components/Button.tsx` y `src/components/Button.css`
    - Variantes: primary, secondary, destructive, ghost
    - Props: variant, size, disabled, onClick, children
    - _Requerimientos: 16.4_

  - [x] 5.3 Crear `src/components/DataTable.tsx` y `src/components/DataTable.css`
    - Props genéricas: columns, data, onRowClick, rowClassName, emptyMessage
    - Soporte para renderizado custom por columna
    - _Requerimientos: 4.1, 7.1, 10.1_

  - [x] 5.4 Crear `src/components/SearchBar.tsx` y `src/components/SearchBar.css`
    - Campo de búsqueda con ícono y debounce
    - _Requerimientos: 4.3, 10.4_

  - [x] 5.5 Crear `src/components/StatusFilter.tsx` y `src/components/StatusFilter.css`
    - Selector de filtro por estado con opciones dinámicas
    - _Requerimientos: 4.2, 7.4_

  - [x] 5.6 Crear `src/components/MetricCard.tsx` y `src/components/MetricCard.css`
    - Tarjeta de métrica con título, valor, ícono y variante de color
    - _Requerimientos: 3.1_

  - [x] 5.7 Crear `src/components/Modal.tsx` y `src/components/Modal.css`
    - Diálogo modal con open, onClose, title y children
    - _Requerimientos: 16.4_

  - [x] 5.8 Crear `src/components/FormField.tsx`, `src/components/Select.tsx`, `src/components/StatusBadge.tsx`, `src/components/EmptyState.tsx`
    - FormField: wrapper con label y error inline
    - Select: select estilizado con options, value, onChange
    - StatusBadge: etiqueta visual de estado
    - EmptyState: estado vacío para listas con ícono y acción
    - _Requerimientos: 5.6, 8.4, 16.3, 16.4_

  - [x] 5.9 Crear `src/components/RoleGate.tsx`
    - Renderizado condicional basado en allowedRoles del usuario actual
    - _Requerimientos: 13.1, 13.2, 13.3_

  - [x] 5.10 Crear `src/components/DueDateIndicator.tsx` y `src/components/DueDateIndicator.css`
    - Indicador visual de advertencia (amarillo) si 0 < días ≤ 2
    - Indicador visual crítico (rojo) si hoy > dueDate
    - Sin indicador si días > 2
    - _Requerimientos: 7.2, 7.3_

  - [x] 5.11 Test de propiedad para indicadores de fecha de entrega
    - **Propiedad 6: Indicadores de fecha de entrega en pedidos**
    - **Valida: Requerimientos 7.2, 7.3**

  - [x] 5.12 Crear `src/components/LowStockIndicator.tsx`
    - Indicador visual si alguna variante del producto tiene stock ≤ minStock
    - _Requerimientos: 10.2_

  - [x] 5.13 Test de propiedad para indicador de stock bajo
    - **Propiedad 13: Indicador de stock bajo en productos**
    - **Valida: Requerimientos 10.2**

- [x] 6. Checkpoint — Verificar componentes reutilizables
  - Asegurar que todos los tests pasan, consultar al usuario si surgen dudas.

- [x] 7. Implementar layout, navegación y protección de rutas
  - [x] 7.1 Crear `src/components/ProtectedRoute.tsx`
    - Redirigir a /login si no hay sesión activa
    - Mostrar acceso denegado si el rol no tiene permiso
    - _Requerimientos: 1.4, 13.4_

  - [x] 7.2 Test de propiedad para protección de rutas
    - **Propiedad 11: Protección de rutas por autenticación y rol**
    - **Valida: Requerimientos 1.4, 13.4**

  - [x] 7.3 Crear `src/components/AppLayout.tsx` y `src/components/AppLayout.css`
    - Layout con Sidebar + TopBar + Outlet para contenido de página
    - Sidebar con NavLinks a Dashboard, Cotizaciones, Pedidos, Inventario
    - TopBar con breadcrumb, nombre de usuario/rol y AlertBell
    - _Requerimientos: 2.1, 2.3, 2.5_

  - [x] 7.4 Crear `src/components/Sidebar.tsx` y `src/components/Sidebar.css`
    - Menú lateral con enlaces activos resaltados
    - Colapsar a menú hamburguesa en viewport < 768px
    - Mostrar info del usuario (nombre y rol)
    - _Requerimientos: 2.1, 2.3, 2.4_

  - [x] 7.5 Crear `src/components/TopBar.tsx` y `src/components/TopBar.css`
    - Botón hamburguesa (móvil), breadcrumb, AlertBell con badge
    - _Requerimientos: 2.4, 2.5, 12.4_

  - [x] 7.6 Crear `src/components/AlertBell.tsx` y `src/components/AlertPanel.tsx`
    - Badge numérico con conteo de alertas
    - Panel desplegable con lista de alertas ordenadas por severidad
    - Clic en alerta navega al recurso asociado
    - _Requerimientos: 12.4, 12.5, 12.6_

  - [x] 7.7 Configurar React Router en `src/App.tsx`
    - Instalar react-router-dom v7
    - Definir rutas: /login, /dashboard, /cotizaciones, /cotizaciones/nueva, /cotizaciones/:id, /pedidos, /pedidos/nuevo, /pedidos/:id, /inventario, /inventario/:id
    - Envolver rutas protegidas con ProtectedRoute
    - Usar React.lazy + Suspense para todas las páginas
    - Envolver con AuthProvider → DataProvider → AlertProvider
    - _Requerimientos: 2.2, 1.4, 14.1_

- [x] 8. Implementar páginas de autenticación y dashboard
  - [x] 8.1 Crear `src/pages/LoginPage.tsx` y `src/pages/LoginPage.css`
    - Pantalla de login con selector de rol (admin/vendedor) y botón de confirmar
    - Al confirmar, almacenar sesión y redirigir a /dashboard
    - _Requerimientos: 1.1, 1.2_

  - [x] 8.2 Crear `src/pages/DashboardPage.tsx` y `src/pages/DashboardPage.css`
    - 3 MetricCards: cotizaciones pendientes, pedidos activos, productos con stock bajo
    - Lista de alertas activas con navegación al recurso
    - Filtrar por rol usando useDataScope
    - _Requerimientos: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 9. Implementar módulo de cotizaciones
  - [x] 9.1 Crear `src/pages/QuotationListPage.tsx` y `src/pages/QuotationListPage.css`
    - DataTable con columnas: número, cliente, fecha, estado, total
    - SearchBar + StatusFilter
    - Navegación al detalle al hacer clic en fila
    - _Requerimientos: 4.1, 4.2, 4.3, 4.4_

  - [x] 9.2 Crear `src/pages/QuotationFormPage.tsx` y `src/pages/QuotationFormPage.css`
    - Formulario con: selección de cliente, lista dinámica de líneas de producto, notas
    - Cada línea: producto, variante, cantidad, precio unitario
    - Recalcular subtotales y total en tiempo real
    - Validación al guardar (cliente requerido, al menos 1 línea)
    - Guardar como borrador vía dispatch QUOTATION_CREATE
    - _Requerimientos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 9.3 Crear `src/pages/QuotationDetailPage.tsx` y `src/pages/QuotationDetailPage.css`
    - Mostrar datos completos de la cotización (header, líneas, total)
    - Botones Aprobar/Rechazar visibles solo para admin (usando RoleGate)
    - Botón "Crear Pedido" visible si cotización está aprobada (solo admin)
    - _Requerimientos: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Implementar módulo de pedidos
  - [x] 10.1 Crear `src/pages/OrderListPage.tsx` y `src/pages/OrderListPage.css`
    - DataTable con columnas: número, cliente, fecha creación, dueDate, estado, total
    - DueDateIndicator en cada fila según condiciones
    - StatusFilter + navegación al detalle
    - _Requerimientos: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 10.2 Crear `src/pages/OrderFormPage.tsx` y `src/pages/OrderFormPage.css`
    - Formulario con: cliente, fecha de entrega, lista dinámica de líneas, notas
    - Validación de stock insuficiente inline
    - Validación completa al guardar
    - Al confirmar: dispatch ORDER_CREATE + STOCK_DEDUCT
    - _Requerimientos: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 10.3 Crear `src/pages/OrderDetailPage.tsx` y `src/pages/OrderDetailPage.css`
    - Mostrar datos del pedido: cliente, fechas, estado, líneas con variantes, total
    - Botón "Marcar Entregado" visible solo para admin
    - Controles deshabilitados si pedido está entregado
    - Enlace a cotización de origen si existe
    - _Requerimientos: 9.1, 9.2, 9.3, 9.4_

- [x] 11. Implementar módulo de inventario
  - [x] 11.1 Crear `src/pages/InventoryListPage.tsx` y `src/pages/InventoryListPage.css`
    - DataTable con columnas: nombre, categoría, total variantes, stock total
    - LowStockIndicator en filas con stock bajo
    - SearchBar para filtrar por nombre/categoría
    - Navegación al detalle
    - _Requerimientos: 10.1, 10.2, 10.3, 10.4_

  - [x] 11.2 Crear `src/pages/InventoryDetailPage.tsx` y `src/pages/InventoryDetailPage.css`
    - Header con info del producto
    - Tabla de variantes (talla, color, stock, minStock)
    - Formulario "Agregar Variante" visible solo para admin (RoleGate)
    - Edición de stock inline solo para admin
    - _Requerimientos: 11.1, 11.2, 11.3, 11.4_

- [x] 12. Checkpoint — Verificar flujos completos
  - Asegurar que todos los tests pasan, consultar al usuario si surgen dudas.

- [x] 13. Diseño responsivo y ajustes finales
  - [x] 13.1 Implementar breakpoints responsivos en todos los componentes
    - 375px (móvil): layout de una columna, sidebar oculto
    - 768px (tablet): sidebar colapsable, tablas con scroll horizontal
    - 1024px (laptop): layout completo
    - 1440px (desktop): ancho máximo contenido
    - _Requerimientos: 14.1, 14.2_

  - [x] 13.2 Crear página `src/pages/NotFoundPage.tsx`
    - Mostrar "No Encontrado" para IDs inexistentes con opción de volver
    - _Requerimientos: manejo de errores de navegación_

  - [x] 13.3 Crear página `src/pages/AccessDeniedPage.tsx`
    - Mostrar "Acceso Denegado" con botón para volver al Dashboard
    - _Requerimientos: 13.4_

- [x] 14. Checkpoint final — Verificar aplicación completa
  - Asegurar que todos los tests pasan y la aplicación compila correctamente con `pnpm build`.
  - Consultar al usuario si surgen dudas.

- [ ] 15. Extender modelos de datos y reducer para Requerimientos 17-21
  - [ ] 15.1 Actualizar `src/types/models.ts` con nuevos tipos
    - Agregar `estimatedDeliveryDate?: string` a la interfaz `Quotation`
    - Agregar tipo `PaymentMethod = 'transferencia' | 'efectivo'`
    - Agregar interfaz `Deposit { id: string; amount: number; method: PaymentMethod; date: string }`
    - Agregar `deposits: Deposit[]` a la interfaz `Order`
    - _Requerimientos: 19.1, 19.2, 21.1, 21.2_

  - [ ] 15.2 Actualizar `src/types/actions.ts` con nuevas acciones
    - Agregar `CLIENT_CREATE`: payload `Omit<Client, 'id'>`
    - Agregar `CLIENT_UPDATE`: payload `{ id: string; changes: Partial<Omit<Client, 'id'>> }`
    - Agregar `CLIENT_DELETE`: payload `{ id: string }`
    - Agregar `DEPOSIT_ADD`: payload `{ orderId: string; deposit: Omit<Deposit, 'id'> }`
    - Agregar `DEPOSIT_REMOVE`: payload `{ orderId: string; depositId: string }`
    - _Requerimientos: 17.3, 17.5, 17.7, 21.3, 21.7_

  - [ ] 15.3 Extender `src/lib/dataReducer.ts` con los nuevos casos
    - Implementar `CLIENT_CREATE`: generar id con `crypto.randomUUID()`, agregar a `state.clients`
    - Implementar `CLIENT_UPDATE`: actualizar campos del cliente por id
    - Implementar `CLIENT_DELETE`: filtrar el cliente por id
    - Implementar `DEPOSIT_ADD`: generar id, agregar depósito al array `deposits` del pedido correspondiente
    - Implementar `DEPOSIT_REMOVE`: filtrar el depósito por id dentro del pedido correspondiente
    - Actualizar `ORDER_CREATE_FROM_QUOTATION` para incluir `deposits: []` en el pedido creado
    - _Requerimientos: 17.3, 17.5, 17.7, 21.3, 21.7, 20.4_

  - [ ] 15.4 Actualizar `src/lib/mockData.ts`
    - Asegurar que los pedidos en mockData incluyan el campo `deposits: []` (o con depósitos de ejemplo)
    - Asegurar que las cotizaciones incluyan `estimatedDeliveryDate` en al menos una
    - _Requerimientos: 15.1, 19.2, 21.1_

- [ ] 16. Implementar lógica de validación para clientes y depósitos
  - [ ] 16.1 Crear `src/lib/clientValidation.ts`
    - Función `validateClientForm(data: { name: string; email: string; phone: string })` → errores si nombre vacío/solo espacios
    - Retornar array de `ValidationError` (reusar tipo existente de `formValidation.ts`)
    - _Requerimientos: 17.8, 18.5_

  - [ ]* 16.2 Crear test de propiedad `src/lib/clientValidation.property.test.ts`
    - **Propiedad 16: Validación de formulario de cliente rechaza nombre vacío**
    - **Valida: Requerimientos 17.8, 18.5**

  - [ ] 16.3 Crear `src/lib/depositValidation.ts`
    - Función `validateDepositForm(data: { amount: number; date: string })` → errores si monto ≤ 0 o fecha vacía
    - Función `checkDepositExcess(amount: number, pendingBalance: number)` → advertencia si monto > saldo pendiente
    - Función `calculatePendingBalance(orderTotal: number, deposits: Deposit[])` → saldo pendiente
    - _Requerimientos: 21.4, 21.5, 21.6_

  - [ ]* 16.4 Crear test de propiedad `src/lib/depositValidation.property.test.ts`
    - **Propiedad 19: Cálculo de saldo pendiente y advertencia de exceso**
    - **Valida: Requerimientos 21.4, 21.6**

- [ ] 17. Checkpoint — Verificar modelos y validaciones
  - Asegurar que todos los tests pasan, consultar al usuario si surgen dudas.

- [ ] 18. Implementar componentes nuevos para clientes y depósitos
  - [ ] 18.1 Crear `src/components/ConfirmDialog.tsx` y `src/components/ConfirmDialog.css`
    - Props: `open`, `title`, `message`, `onConfirm`, `onCancel`, `variant` (destructive | default)
    - Basado en el componente `Modal` existente con botones Confirmar/Cancelar
    - _Requerimientos: 17.6_

  - [ ] 18.2 Crear `src/components/ClientForm.tsx` y `src/components/ClientForm.css`
    - Props: `client?` (undefined = crear, definido = editar), `onSave`, `onCancel`, `errors`
    - Campos: nombre (requerido), correo electrónico, teléfono de contacto
    - Usar `validateClientForm` para validación al guardar
    - _Requerimientos: 17.2, 17.4_

  - [ ] 18.3 Crear `src/components/InlineClientForm.tsx` y `src/components/InlineClientForm.css`
    - Props: `onSave`, `onCancel`
    - Formulario embebido (no modal) con campos: nombre, email, teléfono
    - Al guardar: validar con `validateClientForm`, llamar `onSave` con datos
    - Al cancelar: cerrar sin modificar estado
    - _Requerimientos: 18.2, 18.3, 18.4, 18.5_

  - [ ] 18.4 Crear `src/components/DepositForm.tsx` y `src/components/DepositForm.css`
    - Props: `pendingBalance`, `onSave`, `onCancel`
    - Campos: monto (number), método de pago (select: transferencia/efectivo), fecha (date)
    - Validación: monto > 0, fecha requerida
    - Mostrar advertencia si monto > pendingBalance (no bloquear envío)
    - _Requerimientos: 21.2, 21.5, 21.6_

  - [ ] 18.5 Crear `src/components/DepositSection.tsx` y `src/components/DepositSection.css`
    - Props: `order`, `onAdd`, `onRemove`, `isDelivered`
    - Mostrar tabla de depósitos (monto, método, fecha, acción eliminar)
    - Mostrar resumen: total acumulado de depósitos y saldo pendiente
    - Botón "Agregar Depósito" que muestra/oculta `DepositForm`
    - Si `isDelivered`: permitir agregar pero deshabilitar eliminación
    - _Requerimientos: 21.1, 21.3, 21.4, 21.7, 21.8_

- [ ] 19. Implementar página de clientes y actualizar páginas existentes
  - [ ] 19.1 Crear `src/pages/ClientListPage.tsx` y `src/pages/ClientListPage.css`
    - DataTable con columnas: nombre, correo electrónico, teléfono, acciones (editar, eliminar)
    - SearchBar para filtrar por nombre, correo o teléfono
    - Botón "Nuevo Cliente" que abre Modal con ClientForm
    - Clic en "Editar" abre Modal con ClientForm precargado
    - Clic en "Eliminar" abre ConfirmDialog, al confirmar despacha CLIENT_DELETE
    - _Requerimientos: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.9_

  - [ ] 19.2 Actualizar `src/pages/QuotationFormPage.tsx`
    - Agregar botón "Crear nuevo cliente" junto al selector de cliente
    - Al hacer clic, mostrar `InlineClientForm` debajo del selector
    - Al guardar cliente inline: despachar CLIENT_CREATE, seleccionar automáticamente el nuevo cliente
    - Al cancelar: cerrar formulario inline sin cambios
    - Agregar campo opcional de tipo fecha "Fecha de envío/entrega estimada" (`estimatedDeliveryDate`)
    - Incluir `estimatedDeliveryDate` en el payload de QUOTATION_CREATE
    - _Requerimientos: 18.1, 18.2, 18.3, 18.4, 18.6, 19.1, 19.2, 19.3_

  - [ ] 19.3 Actualizar `src/pages/QuotationDetailPage.tsx`
    - Mostrar `estimatedDeliveryDate` en la información de la cotización (si existe)
    - Cambiar botón "Crear Pedido" para que sea visible tanto para admin como para vendedor (propio)
    - Precargar `estimatedDeliveryDate` como valor sugerido del campo fecha de entrega en el modal de conversión
    - Mostrar datos heredados en el modal de confirmación (cliente, líneas, total)
    - Validar que dueDate sea requerido antes de confirmar
    - _Requerimientos: 19.4, 19.5, 20.1, 20.2, 20.3, 20.6, 20.7, 20.8_

  - [ ] 19.4 Actualizar `src/pages/OrderDetailPage.tsx`
    - Agregar sección `DepositSection` con la lista de depósitos del pedido
    - Conectar `onAdd` para despachar `DEPOSIT_ADD` con orderId
    - Conectar `onRemove` para despachar `DEPOSIT_REMOVE` con orderId y depositId
    - Pasar `isDelivered` para controlar habilitación de eliminación
    - _Requerimientos: 21.1, 21.3, 21.7, 21.8_

- [ ] 20. Configurar ruta y navegación para Clientes
  - [ ] 20.1 Actualizar `src/App.tsx`
    - Agregar lazy import de `ClientListPage`
    - Agregar ruta `/clientes` dentro de las rutas protegidas con AppLayout
    - _Requerimientos: 17.10, 20.7_

  - [ ] 20.2 Actualizar `src/components/Sidebar.tsx`
    - Agregar enlace "Clientes" en `navItems` con `to: '/clientes'`
    - Posicionar después de "Inventario"
    - _Requerimientos: 17.10_

- [ ] 21. Checkpoint — Verificar nuevos flujos completos
  - Asegurar que todos los tests pasan y que los flujos de clientes, conversión de cotización a pedido y depósitos funcionan correctamente.
  - Verificar compilación con `pnpm build`.
  - Consultar al usuario si surgen dudas.

- [ ] 22. Tests de propiedad para nuevas funcionalidades
  - [ ]* 22.1 Crear test de propiedad `src/lib/dataReducer.clients.property.test.ts`
    - **Propiedad 15: CRUD de clientes preserva integridad del estado**
    - Verificar que CLIENT_CREATE incrementa lista en 1 con datos correctos
    - Verificar que CLIENT_UPDATE modifica solo el cliente indicado
    - Verificar que CLIENT_DELETE decrementa lista en 1 sin dejar el id eliminado
    - **Valida: Requerimientos 17.3, 17.5, 17.7**

  - [ ]* 22.2 Crear test de propiedad `src/lib/dataReducer.deposits.property.test.ts`
    - **Propiedad 18: Agregar y eliminar depósitos mantiene consistencia**
    - Verificar que DEPOSIT_ADD incrementa lista de depósitos del pedido en 1
    - Verificar que DEPOSIT_REMOVE decrementa lista de depósitos del pedido en 1
    - Verificar que otros pedidos no se alteran
    - **Valida: Requerimientos 21.3, 21.7**

  - [ ]* 22.3 Extender test de propiedad existente en `src/pages/OrderFromQuotation.property.test.ts` o crear nuevo
    - **Propiedad 17: Conversión de cotización a pedido hereda estimatedDeliveryDate como dueDate sugerido**
    - Verificar que el pedido creado tiene `quotationId` igual al id de la cotización
    - Verificar que si se usa estimatedDeliveryDate como dueDate, coinciden
    - **Valida: Requerimientos 19.5, 20.3, 20.5**

- [ ] 23. Checkpoint final — Verificar aplicación completa con nuevas funcionalidades
  - Asegurar que todos los tests pasan y la aplicación compila correctamente con `pnpm build`.
  - Consultar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requerimientos específicos que cubre
- Los checkpoints aseguran validación incremental
- Los tests de propiedad validan las 19 propiedades de corrección universales definidas en el diseño
- Los tests unitarios validan escenarios específicos y edge cases
- Instalar dependencias necesarias (react-router-dom, fast-check, @testing-library/react, vitest) al inicio de la implementación
