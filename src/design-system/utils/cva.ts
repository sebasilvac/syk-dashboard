import { cn } from './cn';

type ClassValue = string | undefined | null | false;

interface VariantConfig<V extends Record<string, Record<string, string>>> {
  base: string;
  variants: V;
  compoundVariants?: Array<
    Partial<{ [K in keyof V]: keyof V[K] }> & { class: string }
  >;
  defaultVariants: { [K in keyof V]: keyof V[K] };
}

type VariantProps<V extends Record<string, Record<string, string>>> = {
  [K in keyof V]?: keyof V[K];
};

interface CvaReturn<V extends Record<string, Record<string, string>>> {
  (props?: VariantProps<V> & { className?: string }): string;
  variants: V;
  defaultVariants: { [K in keyof V]: keyof V[K] };
}

/**
 * Creates a variant-aware class generator.
 * Resolves base + variant classes + compound variants + consumer className.
 */
export function cva<V extends Record<string, Record<string, string>>>(
  config: VariantConfig<V>,
): CvaReturn<V> {
  function resolver(props?: VariantProps<V> & { className?: string }): string {
    const resolvedProps = { ...config.defaultVariants, ...props };
    const { className, ...variantSelections } = resolvedProps as Record<string, unknown>;

    // Collect variant classes
    const variantClasses: string[] = [];
    for (const [axis, value] of Object.entries(variantSelections)) {
      const axisConfig = config.variants[axis as keyof V];
      if (axisConfig && value) {
        const cls = axisConfig[value as string];
        if (cls) variantClasses.push(cls);
      }
    }

    // Collect compound variant classes
    const compoundClasses: string[] = [];
    if (config.compoundVariants) {
      for (const compound of config.compoundVariants) {
        const { class: compoundClass, ...conditions } = compound;
        const matches = Object.entries(conditions).every(
          ([key, val]) => resolvedProps[key as keyof typeof resolvedProps] === val,
        );
        if (matches && compoundClass) {
          compoundClasses.push(compoundClass);
        }
      }
    }

    return cn(config.base, ...variantClasses, ...compoundClasses, className as ClassValue);
  }

  resolver.variants = config.variants;
  resolver.defaultVariants = config.defaultVariants;

  return resolver as CvaReturn<V>;
}

export type { VariantConfig, VariantProps, CvaReturn };
