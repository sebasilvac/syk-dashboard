import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { determineRouteAccess } from './ProtectedRoute';
import type { Role } from '@/types/models';

/**
 * Feature: syk-dashboard-ui, Property 11: Protección de rutas por autenticación y rol
 * Validates: Requirements 1.4, 13.4
 */
describe('Property 11: Protección de rutas por autenticación y rol', () => {
  const arbRole = fc.constantFrom<Role>('admin', 'vendedor');
  const arbAllowedRoles = fc.oneof(
    fc.constant(undefined as Role[] | undefined),
    fc.subarray(['admin', 'vendedor'] as Role[], { minLength: 1 })
  );

  it('should redirect to login when user is not authenticated', () => {
    fc.assert(
      fc.property(
        arbRole,
        arbAllowedRoles,
        (role, allowedRoles) => {
          const result = determineRouteAccess(false, role, allowedRoles);
          expect(result).toBe('redirect-to-login');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should deny access when authenticated user role is not in allowedRoles', () => {
    fc.assert(
      fc.property(
        arbRole,
        arbRole,
        (userRole, restrictedToRole) => {
          // Only test when the user's role is NOT in the allowed list
          fc.pre(userRole !== restrictedToRole);
          const allowedRoles: Role[] = [restrictedToRole];
          const result = determineRouteAccess(true, userRole, allowedRoles);
          expect(result).toBe('access-denied');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow access when authenticated user role is in allowedRoles', () => {
    fc.assert(
      fc.property(
        arbRole,
        (userRole) => {
          const allowedRoles: Role[] = [userRole];
          const result = determineRouteAccess(true, userRole, allowedRoles);
          expect(result).toBe('allowed');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow access when no allowedRoles restriction is specified', () => {
    fc.assert(
      fc.property(
        arbRole,
        (userRole) => {
          const result = determineRouteAccess(true, userRole, undefined);
          expect(result).toBe('allowed');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow access when allowedRoles is empty array (no restriction)', () => {
    fc.assert(
      fc.property(
        arbRole,
        (userRole) => {
          const result = determineRouteAccess(true, userRole, []);
          expect(result).toBe('allowed');
        }
      ),
      { numRuns: 100 }
    );
  });
});
