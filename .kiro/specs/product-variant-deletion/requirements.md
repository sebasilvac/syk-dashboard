# Requirements Document

## Introduction

This feature adds the ability to delete products or individual variants from the inventory module. Only admin users can perform deletions. The system must handle referential integrity (products/variants referenced in active orders or quotations) and provide confirmation dialogs to prevent accidental data loss.

## Glossary

- **Inventory_System**: The inventory module of the SYK Dashboard application responsible for managing products and their variants.
- **Admin_User**: A user with the `admin` role who has full access to all operations in the system.
- **Product**: An inventory item identified by name and category, containing one or more variants.
- **Variant**: A specific combination of size and color for a product, with associated stock and minimum stock levels.
- **ConfirmDialog**: The existing confirmation modal component that displays a message and requires explicit user action before proceeding.
- **Active_Reference**: A relationship where a product or variant is included as a line item in an active order or pending quotation.

## Requirements

### Requirement 1: Delete a Product

**User Story:** As an admin user, I want to delete a product from the inventory, so that I can remove items that are no longer sold or relevant.

#### Acceptance Criteria

1. WHEN the Admin_User clicks the delete button on a product, THE Inventory_System SHALL display a ConfirmDialog with the product name and a warning that all variants will also be removed.
2. WHEN the Admin_User confirms the deletion in the ConfirmDialog, THE Inventory_System SHALL remove the product and all its associated variants from the database.
3. WHEN the product is successfully deleted, THE Inventory_System SHALL remove the product from the displayed product list without requiring a full page reload.
4. IF the deletion request fails, THEN THE Inventory_System SHALL revert the optimistic removal and display an error message to the Admin_User.
5. WHILE the user has the role `vendedor`, THE Inventory_System SHALL hide the delete product button.

### Requirement 2: Delete a Single Variant

**User Story:** As an admin user, I want to delete a single variant from a product, so that I can remove sizes or colors that are no longer available without deleting the entire product.

#### Acceptance Criteria

1. WHEN the Admin_User clicks the delete button on a variant row, THE Inventory_System SHALL display a ConfirmDialog identifying the variant by its size and color.
2. WHEN the Admin_User confirms the variant deletion, THE Inventory_System SHALL remove the variant from the database.
3. WHEN the variant is successfully deleted, THE Inventory_System SHALL remove the variant from the displayed variant table without requiring a full page reload.
4. IF the variant deletion request fails, THEN THE Inventory_System SHALL revert the optimistic removal and display an error message to the Admin_User.
5. WHILE the user has the role `vendedor`, THE Inventory_System SHALL hide the delete variant button.

### Requirement 3: Prevent Deletion of Referenced Products

**User Story:** As an admin user, I want the system to prevent me from deleting a product that is referenced in active orders or pending quotations, so that data integrity is maintained.

#### Acceptance Criteria

1. IF a product has variants referenced in active orders or pending quotations, THEN THE Inventory_System SHALL reject the deletion and display a message explaining why the product cannot be deleted.
2. WHEN a product has no active references, THE Inventory_System SHALL allow the deletion to proceed after confirmation.

### Requirement 4: Prevent Deletion of Referenced Variants

**User Story:** As an admin user, I want the system to prevent me from deleting a variant that is referenced in active orders or pending quotations, so that order fulfillment is not compromised.

#### Acceptance Criteria

1. IF a variant is referenced in active orders or pending quotations, THEN THE Inventory_System SHALL reject the deletion and display a message explaining why the variant cannot be deleted.
2. WHEN a variant has no active references, THE Inventory_System SHALL allow the deletion to proceed after confirmation.

### Requirement 5: Prevent Deletion of Last Variant

**User Story:** As an admin user, I want the system to prevent me from deleting the last remaining variant of a product, so that products always have at least one variant.

#### Acceptance Criteria

1. IF the variant is the only variant of the product, THEN THE Inventory_System SHALL reject the deletion and display a message suggesting to delete the entire product instead.
2. WHEN the product has more than one variant, THE Inventory_System SHALL allow individual variant deletion after confirmation.

### Requirement 6: Authorization Enforcement via RLS

**User Story:** As a system administrator, I want deletion operations to be enforced at the database level through RLS policies, so that unauthorized deletions are impossible even if the frontend is bypassed.

#### Acceptance Criteria

1. THE Inventory_System SHALL enforce that only users with the `admin` role can execute DELETE operations on the products table via RLS policies.
2. THE Inventory_System SHALL enforce that only users with the `admin` role can execute DELETE operations on the variants table via RLS policies.
