import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getContrastRatio } from '@/lib/contrastCheck';

/**
 * Feature: dashboard-ui-redesign, Property 1: Dark palette color pairs meet WCAG AA contrast thresholds
 *
 * For any text/background color pair defined in the dark theme design system,
 * the computed contrast ratio SHALL be ≥ 4.5:1 for normal-sized text and
 * ≥ 3:1 for large text (≥18px or ≥14px bold).
 *
 * **Validates: Requirements 2.2, 13.1**
 */

// Helper: arbitrary hex color generator
const arbHexColor = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  )
  .map(
    ([r, g, b]) =>
      `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  );

/**
 * Helper: generate a perturbation around a given hex color.
 * Varies each RGB channel by ±delta (clamped to [0, 255]).
 */
function arbPerturbedColor(hex: string, delta: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return fc
    .tuple(
      fc.integer({ min: Math.max(0, r - delta), max: Math.min(255, r + delta) }),
      fc.integer({ min: Math.max(0, g - delta), max: Math.min(255, g + delta) }),
      fc.integer({ min: Math.max(0, b - delta), max: Math.min(255, b + delta) })
    )
    .map(
      ([pr, pg, pb]) =>
        `#${pr.toString(16).padStart(2, '0')}${pg.toString(16).padStart(2, '0')}${pb.toString(16).padStart(2, '0')}`
    );
}

/**
 * Helper: generate a perturbation that makes a text color darker (reduces luminance).
 * This is the "worst case" direction for contrast — if it still passes, the pair is robust.
 */
function arbDarkerPerturbedText(hex: string, delta: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return fc
    .tuple(
      fc.integer({ min: Math.max(0, r - delta), max: r }),
      fc.integer({ min: Math.max(0, g - delta), max: g }),
      fc.integer({ min: Math.max(0, b - delta), max: b })
    )
    .map(
      ([pr, pg, pb]) =>
        `#${pr.toString(16).padStart(2, '0')}${pg.toString(16).padStart(2, '0')}${pb.toString(16).padStart(2, '0')}`
    );
}

/**
 * Helper: generate a perturbation that makes a background lighter (increases luminance).
 * Combined with darker text, this tests the worst-case contrast reduction.
 */
function arbLighterPerturbedBg(hex: string, delta: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return fc
    .tuple(
      fc.integer({ min: r, max: Math.min(255, r + delta) }),
      fc.integer({ min: g, max: Math.min(255, g + delta) }),
      fc.integer({ min: b, max: Math.min(255, b + delta) })
    )
    .map(
      ([pr, pg, pb]) =>
        `#${pr.toString(16).padStart(2, '0')}${pg.toString(16).padStart(2, '0')}${pb.toString(16).padStart(2, '0')}`
    );
}

// Dark palette color pairs from the design specification
// Normal text pairs require ≥ 4.5:1
const normalTextPairs: Array<{ text: string; bg: string; usage: string; perturbDelta: number }> = [
  { text: '#FFFFFF', bg: '#0B2239', usage: 'Primary text on body', perturbDelta: 5 },
  { text: '#FFFFFF', bg: '#193A59', usage: 'Primary text on sidebar/cards', perturbDelta: 5 },
  { text: '#FFFFFF', bg: '#2A4058', usage: 'Primary text on surface', perturbDelta: 5 },
  { text: '#8FA6BD', bg: '#0B2239', usage: 'Muted text on body', perturbDelta: 3 },
  // Ratio ~4.67 — tight headroom, use minimal perturbation
  { text: '#8FA6BD', bg: '#193A59', usage: 'Muted text on sidebar', perturbDelta: 1 },
  { text: '#E7C7D2', bg: '#0B2239', usage: 'Highlight text on body', perturbDelta: 5 },
  { text: '#E7C7D2', bg: '#2A4058', usage: 'Highlight text on surface', perturbDelta: 3 },
];

// Large text pairs require ≥ 3:1
const largeTextPairs: Array<{ text: string; bg: string; usage: string; perturbDelta: number }> = [
  { text: '#8FA6BD', bg: '#2A4058', usage: 'Muted text on surface (large)', perturbDelta: 5 },
  { text: '#C084A0', bg: '#0B2239', usage: 'Accent on body (large)', perturbDelta: 5 },
  { text: '#C084A0', bg: '#193A59', usage: 'Accent on sidebar (large)', perturbDelta: 5 },
];

describe('Feature: dashboard-ui-redesign, Property 1: Dark palette color pairs meet WCAG AA contrast thresholds', () => {
  // Generic contrast properties (symmetry, identity, bounds)
  describe('Generic contrast ratio properties', () => {
    it('contrast ratio is always >= 1 for any two valid hex colors', () => {
      fc.assert(
        fc.property(arbHexColor, arbHexColor, (fg, bg) => {
          const ratio = getContrastRatio(fg, bg);
          expect(ratio).toBeGreaterThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });

    it('contrast ratio is symmetric (swapping foreground/background gives the same ratio)', () => {
      fc.assert(
        fc.property(arbHexColor, arbHexColor, (fg, bg) => {
          const ratio1 = getContrastRatio(fg, bg);
          const ratio2 = getContrastRatio(bg, fg);
          expect(ratio1).toBeCloseTo(ratio2, 10);
        }),
        { numRuns: 100 }
      );
    });

    it('getContrastRatio(color, color) always returns 1 (same color)', () => {
      fc.assert(
        fc.property(arbHexColor, (color) => {
          const ratio = getContrastRatio(color, color);
          expect(ratio).toBeCloseTo(1, 10);
        }),
        { numRuns: 100 }
      );
    });

    it('black vs white always gives exactly 21:1', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });
  });

  // Dark palette: normal text pairs must meet ≥ 4.5:1
  describe('Normal text pairs (≥ 4.5:1 WCAG AA)', () => {
    for (const pair of normalTextPairs) {
      it(`${pair.usage}: ${pair.text} on ${pair.bg} meets 4.5:1`, () => {
        const ratio = getContrastRatio(pair.text, pair.bg);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
  });

  // Dark palette: large text pairs must meet ≥ 3:1
  describe('Large text pairs (≥ 3:1 WCAG AA)', () => {
    for (const pair of largeTextPairs) {
      it(`${pair.usage}: ${pair.text} on ${pair.bg} meets 3:1`, () => {
        const ratio = getContrastRatio(pair.text, pair.bg);
        expect(ratio).toBeGreaterThanOrEqual(3);
      });
    }
  });

  // Property-based: perturbations around normal text pairs still meet threshold.
  // White text pairs use bidirectional ±5 (high headroom).
  // Muted/highlight pairs use worst-case directional perturbation (text darker, bg lighter).
  // Delta is scaled per pair based on actual headroom above threshold.
  describe('Perturbations around normal text pairs maintain ≥ 4.5:1', () => {
    for (const pair of normalTextPairs) {
      if (pair.text === '#FFFFFF') {
        it(`perturbations (±${pair.perturbDelta} bidirectional) of ${pair.usage} maintain compliance`, () => {
          fc.assert(
            fc.property(
              arbPerturbedColor(pair.text, pair.perturbDelta),
              arbPerturbedColor(pair.bg, pair.perturbDelta),
              (perturbedText, perturbedBg) => {
                const ratio = getContrastRatio(perturbedText, perturbedBg);
                expect(ratio).toBeGreaterThanOrEqual(4.5);
              }
            ),
            { numRuns: 100 }
          );
        });
      } else {
        it(`worst-case perturbations (±${pair.perturbDelta}) of ${pair.usage} maintain compliance`, () => {
          fc.assert(
            fc.property(
              arbDarkerPerturbedText(pair.text, pair.perturbDelta),
              arbLighterPerturbedBg(pair.bg, pair.perturbDelta),
              (perturbedText, perturbedBg) => {
                const ratio = getContrastRatio(perturbedText, perturbedBg);
                expect(ratio).toBeGreaterThanOrEqual(4.5);
              }
            ),
            { numRuns: 100 }
          );
        });
      }
    }
  });

  // Property-based: perturbations around large text pairs still meet threshold
  describe('Perturbations around large text pairs maintain ≥ 3:1', () => {
    for (const pair of largeTextPairs) {
      it(`worst-case perturbations (±${pair.perturbDelta}) of ${pair.usage} maintain compliance`, () => {
        fc.assert(
          fc.property(
            arbDarkerPerturbedText(pair.text, pair.perturbDelta),
            arbLighterPerturbedBg(pair.bg, pair.perturbDelta),
            (perturbedText, perturbedBg) => {
              const ratio = getContrastRatio(perturbedText, perturbedBg);
              expect(ratio).toBeGreaterThanOrEqual(3);
            }
          ),
          { numRuns: 100 }
        );
      });
    }
  });
});
