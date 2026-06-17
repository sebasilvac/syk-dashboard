1. requerimientos generales

✅ Multiusuario → necesitas roles básicos desde el inicio
✅ Pedidos con múltiples productos → modelo relacional obligatorio
✅ Tallas + colores → necesitas estructura flexible (no columnas fijas)
✅ Precio manual → NO necesitas motor de pricing (simplifica harto)
✅ No tracking por etapas → reduces complejidad (bien para MVP)
✅ PWA interna → enfoque tipo backoffice rápido y eficiente

2. Flujos reales (aterrizado a UX)

✅ Flujo principal
Crear Cotización → Aprobar → Crear Pedido
                                ↓
                         Consumir inventario
                                ↓
                          Entregar

✅ Flujo rápido (directo)
Crear Pedido (sin cotización)

3. Alertas (importante para valor real)
Reglas:
📦 Pedido

dueDate - hoy <= 2 días → ⚠️ por vencer
hoy > dueDate → 🔴 atrasado

📦 Inventario

stock <= minStock → ⚠️ stock bajo