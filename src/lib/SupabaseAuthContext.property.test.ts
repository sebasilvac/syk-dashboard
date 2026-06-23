import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { mapSupabaseUser, sanitizeAuthError } from './SupabaseAuthContext';

/**
 * Feature: supabase-integration, Property 1: Role extraction preserves metadata role
 *
 * For any valid role string in user_metadata.role, the auth context exposes
 * the same role value.
 *
 * **Validates: Requirements 2.2**
 */
describe('Feature: supabase-integration, Property 1: Role extraction preserves metadata role', () => {
  it('for any valid role string in user_metadata.role, mapSupabaseUser returns a User with the same role', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('admin', 'vendedor'),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.uuid(),
        (role, name, id) => {
          const supabaseUser = {
            id,
            user_metadata: { role, name },
          };

          const user = mapSupabaseUser(supabaseUser);

          expect(user.role).toBe(role);
          expect(user.id).toBe(id);
          expect(user.name).toBe(name);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: supabase-integration, Property 2: Auth error messages never reveal credential details
 *
 * For any auth error, the sanitized message does NOT contain email addresses
 * nor indicate whether email or password specifically was incorrect.
 *
 * **Validates: Requirements 2.4**
 */
describe('Feature: supabase-integration, Property 2: Auth error messages never reveal credential details', () => {
  const emailArb = fc.tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/),
    fc.stringMatching(/^[a-z][a-z0-9]{1,8}$/),
    fc.constantFrom('.com', '.org', '.net', '.co')
  ).map(([local, domain, tld]) => `${local}@${domain}${tld}`);

  const supabaseErrorMessages = fc.oneof(
    fc.constant('Invalid login credentials'),
    fc.constant('Email not confirmed'),
    fc.constant('User not found'),
    fc.constant('Invalid email or password'),
    fc.string({ minLength: 1, maxLength: 200 })
  );

  it('sanitized error message does NOT contain email addresses nor indicate which credential failed', () => {
    fc.assert(
      fc.property(
        emailArb,
        supabaseErrorMessages,
        (email, errorMessage) => {
          // Construct an AuthError-like object
          const authError = {
            message: errorMessage,
            status: 400,
            name: 'AuthApiError' as const,
            __isAuthError: true as const,
          };

          const sanitized = sanitizeAuthError(authError as any);
          const lowerSanitized = sanitized.toLowerCase();

          // 1. Sanitized message must NOT contain the actual email address
          expect(sanitized).not.toContain(email);

          // 2. Sanitized message must NOT single out one credential as incorrect.
          //    Patterns like "invalid email", "wrong password", "email not found"
          //    reveal WHICH credential failed and enable account enumeration.
          //    Mentioning both together (e.g., "verifica tu email y contraseña")
          //    is acceptable because it doesn't reveal which one specifically failed.
          expect(lowerSanitized).not.toMatch(
            /\b(invalid|wrong|incorrect|bad)\s+(email|password|contraseña)\b/
          );
          expect(lowerSanitized).not.toMatch(
            /\b(email|password|contraseña)\s+(is\s+)?(invalid|wrong|incorrect|not found)\b/
          );

          // 3. Sanitized message must NOT expose the raw Supabase error message
          expect(sanitized).not.toBe(errorMessage);
        }
      ),
      { numRuns: 100 }
    );
  });
});
