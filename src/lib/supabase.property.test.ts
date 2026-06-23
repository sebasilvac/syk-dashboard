import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isValidSupabaseUrl } from './supabase';

/**
 * Feature: supabase-integration, Property 10: URL validation warning
 *
 * For any string value of VITE_SUPABASE_URL, a warning shall be logged if and only if
 * the value does NOT match the pattern `https://*.supabase.co`.
 *
 * We test the pure `isValidSupabaseUrl` function which returns true when the URL matches
 * `https://*.supabase.co` (no warning needed) and false otherwise (warning should be logged).
 *
 * **Validates: Requirements 9.4**
 */
describe('Feature: supabase-integration, Property 10: URL validation warning', () => {
  it('valid Supabase URLs (https://<subdomain>.supabase.co) return true — no warning', () => {
    const validSubdomain = fc.stringMatching(/^[a-z][a-z0-9-]{2,20}$/);

    fc.assert(
      fc.property(validSubdomain, (subdomain) => {
        const url = `https://${subdomain}.supabase.co`;
        expect(isValidSupabaseUrl(url)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('URLs not starting with https:// return false — warning logged', () => {
    const nonHttpsScheme = fc.constantFrom('http://', 'ftp://', 'ws://', '');

    fc.assert(
      fc.property(
        nonHttpsScheme,
        fc.stringMatching(/^[a-z][a-z0-9-]{2,20}$/),
        (scheme, subdomain) => {
          const url = `${scheme}${subdomain}.supabase.co`;
          expect(isValidSupabaseUrl(url)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('URLs not ending with .supabase.co return false — warning logged', () => {
    const domain = fc.constantFrom(
      'example.com',
      'supabase.io',
      'supabase.com',
      'myapp.vercel.app',
      'localhost:54321',
      'supabase.co.evil.com'
    );

    fc.assert(
      fc.property(domain, (d) => {
        const url = `https://${d}`;
        expect(isValidSupabaseUrl(url)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('for any arbitrary string, isValidSupabaseUrl returns true iff it matches https://*.supabase.co', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 200 }), (url) => {
        const result = isValidSupabaseUrl(url);
        const expected = /^https:\/\/.*\.supabase\.co$/.test(url);
        expect(result).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });
});
