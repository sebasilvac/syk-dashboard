# Documento de Requerimientos — SYK Dashboard UI

## Introducción

SYK Dashboard es una PWA interna tipo backoffice para gestión de cotizaciones, pedidos e inventario. Este documento define los requerimientos para la interfaz frontend completa, trabajando con datos mock para validar navegación, flujos y experiencia de usuario. No incluye integración con backend en esta etapa.

## Glosario

- **Dashboard**: Página principal que muestra resumen de métricas, alertas activas y accesos rápidos a las funcionalidades principales.
- **Sistema_de_Navegación**: Componente de navegación lateral y superior que permite al usuario desplazarse entre las páginas de la aplicación.
- **Sistema_de_Autenticación**: Módulo responsable de gestionar el login simulado y la asignación de roles al usuario activo.
- **Módulo_de_Cotizaciones**: Sección de la aplicación que gestiona la creación, visualización, edición y aprobación de cotizaciones.
- **Módulo_de_Pedidos**: Sección de la aplicación que gestiona la creación, visualización, edición y entrega de pedidos.
- **Módulo_de_Inventario**: Sección de la aplicación que gestiona la visualización y actualización de productos con sus variantes de talla y color.
- **Sistema_de_Alertas**: Componente que evalúa condiciones de negocio y muestra notificaciones visuales al usuario sobre pedidos por vencer, atrasados o stock bajo.
- **Motor_de_Roles**: Lógica que determina qué funcionalidades y vistas están disponibles según el rol del usuario activo (admin o vendedor).
- **Cotización**: Documento preliminar que lista productos, cantidades, tallas, colores y precios manuales antes de convertirse en pedido.
- **Pedido**: Orden confirmada que consume inventario y tiene una fecha de entrega (dueDate).
- **Variante**: Combinación específica de talla y color para un producto del inventario.
- **Mock_Data**: Datos estáticos simulados que representan el estado de la aplicación sin conexión a backend.
- **PWA**: Progressive Web App — aplicación web que se puede instalar y funcionar offline.
- **Módulo_de_Clientes**: Sección de la aplicación que gestiona la administración completa (CRUD) de los clientes del negocio.
- **Depósito**: Registro de un pago parcial o total asociado a un pedido, con monto, método de pago (transferencia o efectivo) y fecha del depósito.
- **Conversión_Cotización_Pedido**: Proceso mediante el cual una cotización aprobada se transforma en un pedido activo, heredando sus líneas de producto y datos del cliente.
- **Formulario_Inline_Cliente**: Componente embebido dentro del formulario de cotización que permite crear un nuevo cliente sin abandonar el flujo de creación de cotización.
- **Fecha_Envío_Cotización**: Campo opcional en la cotización que indica una fecha estimada de envío o entrega solicitada por el cliente.

## Requerimientos

### Requerimiento 1: Autenticación y Selección de Rol

**User Story:** Como usuario interno, quiero poder iniciar sesión con un rol simulado (admin o vendedor), para que la aplicación refleje los permisos y vistas correspondientes a mi rol.

#### Criterios de Aceptación

1. WHEN el usuario accede a la aplicación sin sesión activa, THE Sistema_de_Autenticación SHALL mostrar una pantalla de login con selector de rol (admin, vendedor).
2. WHEN el usuario selecciona un rol y confirma, THE Sistema_de_Autenticación SHALL almacenar el rol activo en el estado de la aplicación y redirigir al Dashboard.
3. WHEN el usuario hace clic en cerrar sesión, THE Sistema_de_Autenticación SHALL eliminar la sesión activa y redirigir a la pantalla de login.
4. IF el usuario intenta acceder a una ruta protegida sin sesión activa, THEN THE Sistema_de_Autenticación SHALL redirigir al usuario a la pantalla de login.

---

### Requerimiento 2: Navegación Principal

**User Story:** Como usuario autenticado, quiero navegar entre las secciones principales de la aplicación (Dashboard, Cotizaciones, Pedidos, Inventario), para que pueda acceder rápidamente a cada módulo.

#### Criterios de Aceptación

1. THE Sistema_de_Navegación SHALL mostrar un menú lateral con enlaces a: Dashboard, Cotizaciones, Pedidos e Inventario.
2. WHEN el usuario hace clic en un enlace del menú, THE Sistema_de_Navegación SHALL navegar a la página correspondiente sin recarga completa de la aplicación.
3. WHILE el usuario se encuentra en una página, THE Sistema_de_Navegación SHALL resaltar visualmente el enlace activo en el menú lateral.
4. WHEN el viewport es menor a 768px, THE Sistema_de_Navegación SHALL colapsar el menú lateral en un menú tipo hamburguesa.
5. THE Sistema_de_Navegación SHALL mostrar el nombre del usuario activo y su rol en la barra superior.

---

### Requerimiento 3: Dashboard Principal

**User Story:** Como usuario autenticado, quiero ver un resumen general con métricas clave y alertas activas, para que pueda tener visibilidad rápida del estado del negocio.

#### Criterios de Aceptación

1. THE Dashboard SHALL mostrar tarjetas de resumen con: total de cotizaciones pendientes, total de pedidos activos, total de productos con stock bajo.
2. THE Dashboard SHALL mostrar una lista de alertas activas (pedidos por vencer, pedidos atrasados, stock bajo).
3. WHEN el usuario hace clic en una alerta, THE Dashboard SHALL navegar al detalle del recurso asociado (pedido o producto).
4. WHEN el usuario tiene rol vendedor, THE Dashboard SHALL mostrar solo las cotizaciones y pedidos asignados a ese vendedor.
5. WHEN el usuario tiene rol admin, THE Dashboard SHALL mostrar las métricas globales de todos los vendedores.

---

### Requerimiento 4: Listado de Cotizaciones

**User Story:** Como vendedor, quiero ver una lista de todas las cotizaciones con su estado, para que pueda dar seguimiento y gestionar las cotizaciones pendientes.

#### Criterios de Aceptación

1. THE Módulo_de_Cotizaciones SHALL mostrar una tabla con columnas: número, cliente, fecha de creación, estado (borrador, pendiente, aprobada, rechazada) y total.
2. WHEN el usuario aplica un filtro por estado, THE Módulo_de_Cotizaciones SHALL mostrar solo las cotizaciones que coincidan con el estado seleccionado.
3. WHEN el usuario escribe en el campo de búsqueda, THE Módulo_de_Cotizaciones SHALL filtrar las cotizaciones por nombre de cliente o número de cotización.
4. WHEN el usuario hace clic en una fila de la tabla, THE Módulo_de_Cotizaciones SHALL navegar al detalle de esa cotización.

---

### Requerimiento 5: Crear y Editar Cotización

**User Story:** Como vendedor, quiero crear y editar cotizaciones con múltiples productos, tallas, colores y precios manuales, para que pueda preparar propuestas comerciales para los clientes.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en "Nueva Cotización", THE Módulo_de_Cotizaciones SHALL mostrar un formulario con campos: cliente, productos (lista dinámica), y notas.
2. WHEN el usuario agrega un producto a la cotización, THE Módulo_de_Cotizaciones SHALL permitir seleccionar producto, variante (talla + color), cantidad y precio unitario manual.
3. WHEN el usuario modifica cantidad o precio de un producto, THE Módulo_de_Cotizaciones SHALL recalcular el subtotal de esa línea y el total de la cotización.
4. WHEN el usuario hace clic en "Guardar", THE Módulo_de_Cotizaciones SHALL guardar la cotización en estado borrador en los datos mock.
5. WHEN el usuario elimina un producto de la cotización, THE Módulo_de_Cotizaciones SHALL remover la línea y recalcular el total.
6. IF el usuario intenta guardar una cotización sin cliente o sin al menos un producto, THEN THE Módulo_de_Cotizaciones SHALL mostrar un mensaje de validación indicando los campos requeridos.

---

### Requerimiento 6: Aprobar Cotización y Crear Pedido

**User Story:** Como admin, quiero aprobar cotizaciones y convertirlas en pedidos, para que se pueda dar continuidad al flujo comercial.

#### Criterios de Aceptación

1. WHEN el admin hace clic en "Aprobar" en una cotización pendiente, THE Módulo_de_Cotizaciones SHALL cambiar el estado de la cotización a "aprobada".
2. WHEN una cotización es aprobada, THE Módulo_de_Cotizaciones SHALL mostrar un botón "Crear Pedido" en el detalle de la cotización.
3. WHEN el admin hace clic en "Crear Pedido" desde una cotización aprobada, THE Módulo_de_Pedidos SHALL crear un nuevo pedido con los productos, cantidades y precios de la cotización, y solicitar una fecha de entrega (dueDate).
4. WHEN el admin hace clic en "Rechazar" en una cotización pendiente, THE Módulo_de_Cotizaciones SHALL cambiar el estado a "rechazada".
5. WHILE el usuario tiene rol vendedor, THE Módulo_de_Cotizaciones SHALL ocultar los botones de "Aprobar" y "Rechazar".

---

### Requerimiento 7: Listado de Pedidos

**User Story:** Como usuario autenticado, quiero ver una lista de todos los pedidos con su estado y fecha de entrega, para que pueda dar seguimiento a las entregas pendientes.

#### Criterios de Aceptación

1. THE Módulo_de_Pedidos SHALL mostrar una tabla con columnas: número, cliente, fecha de creación, fecha de entrega (dueDate), estado (activo, entregado) y total.
2. WHEN un pedido tiene dueDate - hoy menor o igual a 2 días, THE Módulo_de_Pedidos SHALL mostrar un indicador visual de advertencia (ícono amarillo) en esa fila.
3. WHEN un pedido tiene hoy mayor a dueDate, THE Módulo_de_Pedidos SHALL mostrar un indicador visual de alerta crítica (ícono rojo) en esa fila.
4. WHEN el usuario aplica un filtro por estado, THE Módulo_de_Pedidos SHALL mostrar solo los pedidos que coincidan con el estado seleccionado.
5. WHEN el usuario hace clic en una fila de la tabla, THE Módulo_de_Pedidos SHALL navegar al detalle de ese pedido.

---

### Requerimiento 8: Crear Pedido Directo (Flujo Rápido)

**User Story:** Como vendedor, quiero crear un pedido directamente sin pasar por cotización, para que pueda atender ventas rápidas que no requieren aprobación previa.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en "Nuevo Pedido", THE Módulo_de_Pedidos SHALL mostrar un formulario con campos: cliente, fecha de entrega (dueDate), productos (lista dinámica) y notas.
2. WHEN el usuario agrega un producto al pedido, THE Módulo_de_Pedidos SHALL permitir seleccionar producto, variante (talla + color), cantidad y precio unitario manual.
3. WHEN el usuario confirma el pedido, THE Módulo_de_Pedidos SHALL guardar el pedido en estado "activo" y descontar las cantidades del inventario mock.
4. IF el usuario intenta crear un pedido sin cliente, sin fecha de entrega o sin al menos un producto, THEN THE Módulo_de_Pedidos SHALL mostrar mensajes de validación indicando los campos requeridos.
5. IF la cantidad solicitada de una variante excede el stock disponible, THEN THE Módulo_de_Pedidos SHALL mostrar una advertencia indicando stock insuficiente para esa variante.

---

### Requerimiento 9: Detalle y Entrega de Pedido

**User Story:** Como usuario autenticado, quiero ver el detalle de un pedido y marcarlo como entregado, para que pueda cerrar el ciclo del pedido.

#### Criterios de Aceptación

1. THE Módulo_de_Pedidos SHALL mostrar en el detalle: datos del cliente, fecha de creación, fecha de entrega, estado, lista de productos con variantes, cantidades, precios y total.
2. WHEN el usuario con rol admin hace clic en "Marcar Entregado", THE Módulo_de_Pedidos SHALL cambiar el estado del pedido a "entregado".
3. WHILE el pedido tiene estado "entregado", THE Módulo_de_Pedidos SHALL deshabilitar las acciones de edición y el botón de entrega.
4. IF el pedido fue creado desde una cotización, THEN THE Módulo_de_Pedidos SHALL mostrar un enlace a la cotización de origen.

---

### Requerimiento 10: Listado de Inventario

**User Story:** Como usuario autenticado, quiero ver el catálogo de productos con sus variantes y niveles de stock, para que pueda conocer la disponibilidad actual.

#### Criterios de Aceptación

1. THE Módulo_de_Inventario SHALL mostrar una tabla con columnas: nombre del producto, categoría, total de variantes y stock total.
2. WHEN un producto tiene al menos una variante con stock menor o igual a minStock, THE Módulo_de_Inventario SHALL mostrar un indicador visual de stock bajo en esa fila.
3. WHEN el usuario hace clic en una fila, THE Módulo_de_Inventario SHALL expandir o navegar al detalle mostrando todas las variantes (talla + color) con su stock individual.
4. WHEN el usuario escribe en el campo de búsqueda, THE Módulo_de_Inventario SHALL filtrar productos por nombre o categoría.

---

### Requerimiento 11: Gestión de Variantes de Inventario

**User Story:** Como admin, quiero agregar y editar variantes de producto (talla + color + stock), para que pueda mantener actualizado el inventario con una estructura flexible.

#### Criterios de Aceptación

1. WHEN el admin hace clic en "Agregar Variante" en el detalle de un producto, THE Módulo_de_Inventario SHALL mostrar un formulario con campos: talla, color, stock y minStock.
2. WHEN el admin edita el stock de una variante, THE Módulo_de_Inventario SHALL actualizar el valor en los datos mock.
3. WHILE el usuario tiene rol vendedor, THE Módulo_de_Inventario SHALL ocultar las acciones de agregar y editar variantes, mostrando solo la vista de lectura.
4. IF el admin intenta guardar una variante sin talla o sin color, THEN THE Módulo_de_Inventario SHALL mostrar un mensaje de validación indicando los campos requeridos.

---

### Requerimiento 12: Sistema de Alertas

**User Story:** Como usuario autenticado, quiero recibir alertas visuales sobre pedidos por vencer, pedidos atrasados y stock bajo, para que pueda tomar acción preventiva.

#### Criterios de Aceptación

1. WHEN un pedido activo tiene (dueDate - fecha_actual) menor o igual a 2 días y (dueDate - fecha_actual) mayor a 0, THE Sistema_de_Alertas SHALL generar una alerta de tipo "por vencer" con severidad advertencia.
2. WHEN un pedido activo tiene fecha_actual mayor a dueDate, THE Sistema_de_Alertas SHALL generar una alerta de tipo "atrasado" con severidad crítica.
3. WHEN una variante de producto tiene stock menor o igual a minStock, THE Sistema_de_Alertas SHALL generar una alerta de tipo "stock bajo" con severidad advertencia.
4. THE Sistema_de_Alertas SHALL mostrar un badge numérico en el ícono de notificaciones con el conteo total de alertas activas.
5. WHEN el usuario hace clic en el ícono de notificaciones, THE Sistema_de_Alertas SHALL mostrar un panel desplegable con la lista de alertas ordenadas por severidad (crítica primero).
6. WHEN el usuario hace clic en una alerta individual, THE Sistema_de_Alertas SHALL navegar al recurso asociado (detalle de pedido o detalle de producto).

---

### Requerimiento 13: Control de Acceso por Rol

**User Story:** Como admin del sistema, quiero que las funcionalidades estén restringidas según el rol del usuario, para que cada rol solo pueda realizar las acciones que le corresponden.

#### Criterios de Aceptación

1. WHILE el usuario tiene rol admin, THE Motor_de_Roles SHALL permitir acceso a todas las funcionalidades: crear/editar/aprobar cotizaciones, crear/editar/entregar pedidos, gestionar inventario.
2. WHILE el usuario tiene rol vendedor, THE Motor_de_Roles SHALL permitir: crear/editar cotizaciones (propias), crear pedidos directos y ver inventario (solo lectura).
3. WHILE el usuario tiene rol vendedor, THE Motor_de_Roles SHALL ocultar: botones de aprobar/rechazar cotizaciones, edición de inventario y marcado de entrega de pedidos.
4. IF un usuario con rol vendedor intenta navegar a una funcionalidad restringida por URL directa, THEN THE Motor_de_Roles SHALL mostrar un mensaje de acceso denegado y redirigir al Dashboard.

---

### Requerimiento 14: Diseño Responsivo y PWA

**User Story:** Como usuario interno, quiero que la aplicación sea instalable, funcione offline con datos cacheados y se adapte a distintos tamaños de pantalla, para que pueda usarla desde cualquier dispositivo.

#### Criterios de Aceptación

1. THE Dashboard SHALL adaptar su layout a los breakpoints: 375px (móvil), 768px (tablet), 1024px (laptop) y 1440px (desktop).
2. WHEN el viewport es menor a 768px, THE Sistema_de_Navegación SHALL reemplazar la barra lateral por un menú colapsable activado con botón hamburguesa.
3. THE PWA SHALL ser instalable en dispositivos compatibles mostrando un prompt de instalación cuando el navegador lo soporte.
4. WHEN la aplicación pierde conexión a internet, THE PWA SHALL servir la versión cacheada de la aplicación permitiendo navegación entre páginas ya visitadas.
5. WHEN hay una nueva versión disponible de la aplicación, THE PWA SHALL mostrar un prompt al usuario para actualizar.

---

### Requerimiento 15: Datos Mock y Estado de la Aplicación

**User Story:** Como desarrollador, quiero que la aplicación funcione completamente con datos mock en memoria, para que pueda probar todos los flujos sin depender de un backend.

#### Criterios de Aceptación

1. THE Mock_Data SHALL incluir al menos: 3 clientes, 5 productos con variantes (talla + color), 4 cotizaciones en distintos estados y 3 pedidos en distintos estados.
2. THE Mock_Data SHALL persistir cambios en el estado durante la sesión del navegador (estado en memoria).
3. WHEN el usuario recarga la aplicación, THE Mock_Data SHALL restaurar los datos al estado inicial predefinido.
4. THE Mock_Data SHALL incluir al menos un pedido con dueDate cercano (menor a 2 días) y uno con dueDate pasado, para demostrar el sistema de alertas.
5. THE Mock_Data SHALL incluir al menos un producto con stock menor o igual a minStock, para demostrar la alerta de stock bajo.

---

### Requerimiento 16: Estilo Visual y Sistema de Diseño

**User Story:** Como usuario interno, quiero que la interfaz siga un estilo visual consistente de minimalismo exagerado, para que la experiencia sea limpia, rápida y profesional.

#### Criterios de Aceptación

1. THE Dashboard SHALL utilizar las CSS custom properties definidas en el sistema de diseño: --color-primary (#334155), --color-accent (#059669), --color-background (#F8FAFC), --color-foreground (#0F172A), --color-destructive (#DC2626), --color-border (#E6E8EA).
2. THE Dashboard SHALL utilizar la tipografía Fira Code para encabezados y datos tabulares, y Fira Sans para texto de cuerpo.
3. THE Dashboard SHALL utilizar íconos SVG (estilo Lucide/Heroicons) para todas las acciones e indicadores, sin uso de emojis.
4. THE Dashboard SHALL aplicar espaciado amplio (whitespace generoso), tipografía bold y decoración mínima siguiendo el estilo de minimalismo exagerado.
5. THE Dashboard SHALL mantener un contraste mínimo de 4.5:1 entre texto y fondo para cumplir con WCAG AA en legibilidad.

---

### Requerimiento 17: Administración de Clientes (CRUD Completo)

**User Story:** Como usuario autenticado, quiero gestionar los clientes del negocio (crear, ver, editar y eliminar), para que pueda mantener actualizada la base de datos de clientes con su información de contacto.

#### Criterios de Aceptación

1. THE Módulo_de_Clientes SHALL mostrar una tabla con columnas: nombre, correo electrónico, teléfono de contacto y acciones (editar, eliminar).
2. WHEN el usuario hace clic en "Nuevo Cliente", THE Módulo_de_Clientes SHALL mostrar un formulario con campos: nombre, correo electrónico y teléfono de contacto.
3. WHEN el usuario completa los campos requeridos y confirma, THE Módulo_de_Clientes SHALL guardar el nuevo cliente en los datos mock y mostrarlo en la tabla.
4. WHEN el usuario hace clic en "Editar" en un cliente existente, THE Módulo_de_Clientes SHALL mostrar el formulario precargado con los datos actuales del cliente.
5. WHEN el usuario modifica los datos de un cliente y confirma, THE Módulo_de_Clientes SHALL actualizar la información del cliente en los datos mock.
6. WHEN el usuario hace clic en "Eliminar" en un cliente, THE Módulo_de_Clientes SHALL solicitar confirmación antes de eliminar el registro.
7. IF el usuario confirma la eliminación, THEN THE Módulo_de_Clientes SHALL remover el cliente de los datos mock.
8. IF el usuario intenta guardar un cliente sin nombre, THEN THE Módulo_de_Clientes SHALL mostrar un mensaje de validación indicando que el nombre es requerido.
9. WHEN el usuario escribe en el campo de búsqueda, THE Módulo_de_Clientes SHALL filtrar la lista de clientes por nombre, correo o teléfono.
10. THE Sistema_de_Navegación SHALL incluir un enlace "Clientes" en el menú lateral que dirija al Módulo_de_Clientes.

---

### Requerimiento 18: Creación Rápida de Cliente desde Cotización

**User Story:** Como vendedor, quiero poder crear un nuevo cliente directamente desde el formulario de cotización sin salir del flujo, para que no tenga que abandonar la creación de la cotización cuando el cliente aún no existe en el sistema.

#### Criterios de Aceptación

1. WHEN el usuario está en el formulario de nueva cotización, THE Módulo_de_Cotizaciones SHALL mostrar un botón "Crear nuevo cliente" junto al selector de cliente.
2. WHEN el usuario hace clic en "Crear nuevo cliente", THE Formulario_Inline_Cliente SHALL desplegarse dentro del formulario de cotización con campos: nombre, correo electrónico y teléfono de contacto.
3. WHEN el usuario completa los datos del nuevo cliente y confirma, THE Formulario_Inline_Cliente SHALL guardar el cliente en los datos mock y seleccionarlo automáticamente en el campo de cliente de la cotización.
4. WHEN el usuario cancela la creación inline del cliente, THE Formulario_Inline_Cliente SHALL cerrarse sin modificar la selección de cliente existente.
5. IF el usuario intenta guardar el cliente inline sin nombre, THEN THE Formulario_Inline_Cliente SHALL mostrar un mensaje de validación indicando que el nombre es requerido.
6. WHEN el cliente se crea exitosamente desde el formulario inline, THE Módulo_de_Cotizaciones SHALL actualizar la lista de opciones del selector de cliente incluyendo el nuevo cliente.

---

### Requerimiento 19: Fecha de Envío/Entrega Opcional en Cotización

**User Story:** Como vendedor, quiero poder registrar opcionalmente una fecha estimada de envío o entrega en la cotización, para que el cliente tenga visibilidad de cuándo recibiría su pedido si la cotización es aprobada.

#### Criterios de Aceptación

1. WHEN el usuario está creando o editando una cotización, THE Módulo_de_Cotizaciones SHALL mostrar un campo opcional de tipo fecha etiquetado "Fecha de envío/entrega estimada".
2. WHEN el usuario selecciona una fecha de envío, THE Módulo_de_Cotizaciones SHALL almacenar la Fecha_Envío_Cotización junto con los demás datos de la cotización.
3. WHEN el usuario no ingresa fecha de envío, THE Módulo_de_Cotizaciones SHALL guardar la cotización sin fecha de envío sin mostrar error de validación.
4. WHEN se visualiza el detalle de una cotización con fecha de envío registrada, THE Módulo_de_Cotizaciones SHALL mostrar la fecha de envío en la información de la cotización.
5. WHEN una cotización con fecha de envío se convierte en pedido, THE Módulo_de_Pedidos SHALL precargar la fecha de envío de la cotización como fecha de entrega (dueDate) sugerida del pedido.

---

### Requerimiento 20: Conversión de Cotización Aprobada a Pedido

**User Story:** Como usuario autenticado (admin o vendedor), quiero poder convertir una cotización aprobada en un pedido directamente, para que el flujo comercial sea ágil y no dependa exclusivamente del administrador.

#### Criterios de Aceptación

1. WHEN una cotización tiene estado "aprobada", THE Módulo_de_Cotizaciones SHALL mostrar un botón "Convertir a Pedido" en el detalle de la cotización.
2. WHEN el usuario hace clic en "Convertir a Pedido", THE Conversión_Cotización_Pedido SHALL mostrar un formulario de confirmación con los datos heredados de la cotización (cliente, líneas de producto, total) y un campo para ingresar la fecha de entrega (dueDate).
3. WHEN la cotización tiene Fecha_Envío_Cotización registrada, THE Conversión_Cotización_Pedido SHALL precargar esa fecha como valor sugerido del campo fecha de entrega.
4. WHEN el usuario confirma la conversión, THE Conversión_Cotización_Pedido SHALL crear un nuevo pedido en estado "activo" con las líneas, cliente y total de la cotización, y descontar las cantidades del inventario mock.
5. WHEN el pedido es creado por conversión, THE Módulo_de_Pedidos SHALL almacenar la referencia a la cotización de origen (quotationId) en el pedido.
6. IF el usuario intenta convertir una cotización sin ingresar fecha de entrega, THEN THE Conversión_Cotización_Pedido SHALL mostrar un mensaje de validación indicando que la fecha de entrega es requerida.
7. WHILE el usuario tiene rol vendedor, THE Módulo_de_Cotizaciones SHALL permitir convertir a pedido las cotizaciones aprobadas asignadas a ese vendedor.
8. WHILE el usuario tiene rol admin, THE Módulo_de_Cotizaciones SHALL permitir convertir a pedido cualquier cotización aprobada.

---

### Requerimiento 21: Registro de Múltiples Depósitos/Pagos en Pedido

**User Story:** Como usuario autenticado, quiero registrar uno o más depósitos (pagos) en un pedido, indicando monto, método de pago y fecha, para que pueda llevar un control de los pagos recibidos por cada pedido.

#### Criterios de Aceptación

1. WHEN el usuario visualiza el detalle de un pedido activo, THE Módulo_de_Pedidos SHALL mostrar una sección "Depósitos/Pagos" con la lista de depósitos registrados y un botón "Agregar Depósito".
2. WHEN el usuario hace clic en "Agregar Depósito", THE Módulo_de_Pedidos SHALL mostrar un formulario con campos: monto, método de pago (transferencia o efectivo) y fecha del depósito.
3. WHEN el usuario completa los datos del depósito y confirma, THE Módulo_de_Pedidos SHALL agregar el Depósito a la lista de depósitos del pedido en los datos mock.
4. THE Módulo_de_Pedidos SHALL mostrar el total acumulado de depósitos y el saldo pendiente (total del pedido menos suma de depósitos) en la sección de depósitos.
5. IF el usuario intenta registrar un depósito sin monto o sin fecha, THEN THE Módulo_de_Pedidos SHALL mostrar un mensaje de validación indicando los campos requeridos.
6. IF el monto del depósito ingresado excede el saldo pendiente del pedido, THEN THE Módulo_de_Pedidos SHALL mostrar una advertencia indicando que el monto supera el saldo pendiente.
7. WHEN el usuario elimina un depósito registrado, THE Módulo_de_Pedidos SHALL remover el depósito de la lista y recalcular el saldo pendiente.
8. WHILE el pedido tiene estado "entregado", THE Módulo_de_Pedidos SHALL permitir agregar depósitos pero deshabilitar la eliminación de depósitos existentes.
