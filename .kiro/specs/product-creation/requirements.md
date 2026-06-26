# Requirements Document — Product Creation

## Introduction

Funcionalidad para crear nuevos productos y sus variantes desde la sección de inventario del SYK Dashboard. Actualmente la sección de inventario solo permite visualizar productos existentes y gestionar variantes de productos ya creados. Esta feature agrega la capacidad de crear productos desde cero con una o más variantes iniciales, accesible solo para usuarios con rol `admin`.

## Glossary

- **Product_Form**: Formulario de creación de producto que recopila nombre, categoría y variantes iniciales del nuevo producto.
- **Variant_Row**: Fila dentro del formulario de creación que representa una variante con campos de talla, color, stock y stock mínimo.
- **Product_Validator**: Módulo de validación que verifica la conformidad de los datos del producto antes de persistirlos.
- **Product_Query**: Función de la capa de consultas que inserta un producto con sus variantes en Supabase.
- **Inventory_List**: Página de listado de inventario (`InventoryListPage`) que muestra todos los productos.
- **Admin**: Usuario con rol `admin` que tiene acceso completo a todas las operaciones.
- **Vendedor**: Usuario con rol `vendedor` que tiene acceso de solo lectura al inventario.

## Requirements

### Requirement 1: Navigation to Product Creation

**User Story:** Como admin, quiero acceder a un formulario de creación de productos desde el listado de inventario, para poder registrar productos nuevos de forma rápida.

#### Acceptance Criteria

1. WHILE a user has the `admin` role, THE Inventory_List SHALL display a "Nuevo Producto" button in the page header
2. WHEN the admin clicks the "Nuevo Producto" button, THE Application SHALL navigate to the route `/inventario/nuevo`
3. WHILE a user has the `vendedor` role, THE Inventory_List SHALL NOT display the "Nuevo Producto" button
4. THE Application SHALL register the `/inventario/nuevo` route with lazy-loaded component and protected access for authenticated users

---

### Requirement 2: Product Form Structure

**User Story:** Como admin, quiero un formulario para ingresar los datos del producto y sus variantes, para que pueda crear productos completos en un solo paso.

#### Acceptance Criteria

1. THE Product_Form SHALL display input fields for product name and category
2. THE Product_Form SHALL display a section for managing variant rows with fields: size, color, stock, and minimum stock
3. THE Product_Form SHALL display at least one Variant_Row by default when the form loads
4. WHEN the admin clicks "Agregar Variante", THE Product_Form SHALL append a new empty Variant_Row to the variants section
5. WHEN the admin clicks the remove button on a Variant_Row, THE Product_Form SHALL remove that row from the variants section
6. WHILE only one Variant_Row exists, THE Product_Form SHALL disable the remove button to prevent leaving zero variants
7. THE Product_Form SHALL display a "Crear Producto" submit button and a "Cancelar" button
8. WHEN the admin clicks "Cancelar", THE Application SHALL navigate back to `/inventario` without persisting data

---

### Requirement 3: Product Form Validation

**User Story:** Como admin, quiero que el sistema valide los datos antes de crear el producto, para evitar productos incompletos o con datos inválidos.

#### Acceptance Criteria

1. WHEN the admin submits the form with an empty product name, THE Product_Validator SHALL return an error "El nombre del producto es requerido"
2. WHEN the admin submits the form with an empty category, THE Product_Validator SHALL return an error "La categoría es requerida"
3. WHEN a Variant_Row has an empty size field, THE Product_Validator SHALL return an error "La talla es requerida" for that variant
4. WHEN a Variant_Row has an empty color field, THE Product_Validator SHALL return an error "El color es requerido" for that variant
5. WHEN a Variant_Row has a stock value less than zero, THE Product_Validator SHALL return an error "El stock no puede ser negativo"
6. WHEN a Variant_Row has a minimum stock value less than zero, THE Product_Validator SHALL return an error "El stock mínimo no puede ser negativo"
7. WHEN validation fails, THE Product_Form SHALL display error messages inline next to the corresponding fields
8. WHEN validation fails, THE Product_Form SHALL NOT submit data to the server

---

### Requirement 4: Product Persistence

**User Story:** Como admin, quiero que el producto y sus variantes se guarden en la base de datos, para que estén disponibles en el inventario inmediatamente.

#### Acceptance Criteria

1. WHEN the admin submits a valid product form, THE Product_Query SHALL insert the product record into the `products` table with the provided name and category
2. WHEN the product insert succeeds, THE Product_Query SHALL insert all variant records into the `variants` table with the corresponding `product_id`, size, color, stock, and min_stock values
3. WHEN the product and all variants are persisted successfully, THE Application SHALL navigate to `/inventario` and the new product SHALL appear in the Inventory_List
4. IF the product insert fails due to a server error, THEN THE Product_Form SHALL display a descriptive error message and retain the form data
5. IF a variant insert fails after the product was created, THEN THE Product_Form SHALL display an error message indicating which variants failed

---

### Requirement 5: Optimistic UI Update

**User Story:** Como admin, quiero que el producto aparezca en la lista inmediatamente después de crearlo, para tener una experiencia rápida y fluida.

#### Acceptance Criteria

1. WHEN the admin submits a valid form, THE Application SHALL apply an optimistic update adding the new product to the local state before the server confirms
2. WHEN the server confirms the creation, THE Application SHALL replace the optimistic record with the server-confirmed record (including the real UUID)
3. IF the server rejects the creation, THEN THE Application SHALL remove the optimistic record from local state and display the error to the admin

---

### Requirement 6: Form Accessibility and Dark Mode

**User Story:** Como admin, quiero que el formulario sea accesible y funcione correctamente en modo oscuro, para poder usarlo en cualquier contexto.

#### Acceptance Criteria

1. THE Product_Form SHALL associate every input with a visible label using `htmlFor` and `id` attributes
2. THE Product_Form SHALL display error messages using `aria-describedby` linked to the corresponding input
3. THE Product_Form SHALL support keyboard navigation allowing tab traversal through all fields and buttons
4. THE Product_Form SHALL maintain WCAG AA contrast ratios in both light and dark themes
5. THE Product_Form SHALL use the existing theme tokens (bg-primary, bg-secondary, text-primary, text-muted, accent, secondary) for consistent styling

---

### Requirement 7: Product Creation Validation Logic (Testable)

**User Story:** Como desarrollador, quiero que la lógica de validación de productos sea pura y testeable, para garantizar la correctness del formulario con property-based tests.

#### Acceptance Criteria

1. THE Product_Validator SHALL be implemented as a pure function that receives form data and returns an array of validation errors
2. FOR ALL valid product form data (non-empty name, non-empty category, at least one variant with non-empty size, non-empty color, stock >= 0, minStock >= 0), THE Product_Validator SHALL return an empty error array
3. FOR ALL invalid product form data, THE Product_Validator SHALL return at least one error with a descriptive message and field identifier
4. THE Product_Validator SHALL be exported from `src/lib/productValidation.ts` as a named export

