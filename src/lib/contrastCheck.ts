/**
 * Parses a hex color string (e.g., "#334155" or "334155") to RGB components [0-255].
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.startsWith('#') ? hex.slice(1) : hex;

  if (cleaned.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }

  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

/**
 * Calculates the relative luminance of a color according to WCAG 2.1.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 *
 * @param r - Red component [0-255]
 * @param g - Green component [0-255]
 * @param b - Blue component [0-255]
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const linearize = (c: number): number => {
    const srgb = c / 255;
    return srgb <= 0.04045
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Calculates the contrast ratio between two colors per WCAG 2.1.
 * Returns a value between 1 and 21.
 *
 * @param foreground - hex color string (e.g., "#0F172A")
 * @param background - hex color string (e.g., "#F8FAFC")
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  const l1 = relativeLuminance(fg.r, fg.g, fg.b);
  const l2 = relativeLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}
