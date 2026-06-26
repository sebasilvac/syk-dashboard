# Design System

Sistema de diseño modular para aplicaciones React + TypeScript + TailwindCSS.

## Requisitos

- React 19+
- TypeScript 5+
- TailwindCSS v4
- Dependencias: `clsx`, `tailwind-merge`

## Instalación

1. Copiar la carpeta `src/design-system/` al directorio `src/` del proyecto destino.

2. Instalar dependencias:
```bash
pnpm add clsx tailwind-merge
```

3. Configurar el path alias `@/` en `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

4. Agregar las CSS custom properties necesarias en tu archivo `globals.css`:
```css
:root, .dark {
  --color-bg-primary: #0B2239;
  --color-bg-secondary: #193A59;
  --color-surface: #2A4058;
  --color-secondary: #4D6A8A;
  --color-text-muted: #8FA6BD;
  --color-accent-soft: #D1AFC0;
  --color-highlight: #E7C7D2;
  --color-accent: #C084A0;
  --color-text-primary: #FFFFFF;
  --shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.25);
  --shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.light {
  --color-bg-primary: #F1F5F9;
  --color-bg-secondary: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-secondary: #CBD5E1;
  --color-text-muted: #475569;
  --color-accent-soft: #BE185D;
  --color-highlight: #9D174D;
  --color-accent: #7C3AED;
  --color-text-primary: #0F172A;
  --shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.10);
}
```

5. Agregar la animación del dropdown en `globals.css`:
```css
@keyframes dropdown-in {
  from { opacity: 0; transform: scale(0.95) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
```

## Uso

### Importar componentes

```tsx
import { Button, Input, Card, Modal, Badge, Tabs, Table, FormField, Select } from '@/design-system/components';
```

### Importar tokens

```tsx
import { spacing, fontSize, radius, shadows, zIndex } from '@/design-system/tokens';
```

### Importar utilidades

```tsx
import { cn, cva } from '@/design-system/utils';
```

## Componentes

### Button
```tsx
<Button variant="primary" size="md" loading={false} onClick={handleClick}>
  Guardar
</Button>
```
Variantes: `primary`, `secondary`, `destructive`, `ghost`
Tamaños: `sm`, `md`, `lg`

### Input
```tsx
<Input label="Email" error="Campo requerido" placeholder="tu@email.com" />
```

### Select
```tsx
<Select
  options={[{ value: '1', label: 'Opción 1' }]}
  value={selected}
  onChange={setSelected}
  placeholder="Seleccionar..."
/>
```

### Card
```tsx
<Card title="Título" description="Descripción" variant="elevated" footer={<Button>Acción</Button>}>
  Contenido
</Card>
```
Variantes: `default`, `elevated`, `outlined`

### Modal
```tsx
<Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirmar" size="md">
  Contenido del modal
</Modal>
```
Tamaños: `sm`, `md`, `lg`

### Badge
```tsx
<Badge variant="success" size="sm">Activo</Badge>
```
Variantes: `default`, `success`, `warning`, `destructive`, `outline`

### Tabs
```tsx
<Tabs
  tabs={[
    { value: 'tab1', label: 'Tab 1', content: <div>Contenido 1</div> },
    { value: 'tab2', label: 'Tab 2', content: <div>Contenido 2</div> },
  ]}
  defaultValue="tab1"
/>
```

### Table
```tsx
<Table
  columns={[
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
  ]}
  data={users}
  onRowClick={(user) => navigate(`/users/${user.id}`)}
  emptyMessage="Sin datos"
/>
```

### FormField
```tsx
<FormField label="Nombre" error={errors.name} htmlFor="name">
  <input id="name" ... />
</FormField>
```

## Arquitectura

```
design-system/
├── primitives/    → Componentes HTML base (no usar directamente)
├── components/    → Wrappers que exponen la API pública
├── tokens/        → Valores de diseño (spacing, typography, etc.)
├── variants/      → Configuraciones de variantes por componente
├── utils/         → Utilidades (cn, cva)
└── index.ts       → Barrel export principal
```

### Regla de importación

- ✅ Importar desde `@/design-system/components/`
- ✅ Importar desde `@/design-system/tokens/`
- ✅ Importar desde `@/design-system/utils/`
- ❌ NO importar desde `@/design-system/primitives/` (uso interno)

## Personalización

### Agregar un nuevo componente

1. Crear el primitivo en `primitives/nuevo.tsx`
2. Crear la configuración de variantes en `variants/nuevo.ts`
3. Crear el wrapper en `components/Nuevo.tsx`
4. Exportar desde `components/index.ts`

### Modificar tokens

Editar los archivos en `tokens/` para cambiar valores globales de diseño.

### Modificar variantes

Editar los archivos en `variants/` para cambiar las opciones visuales de cada componente.
