import { describe, it, expect } from 'vitest';
import { buttonVariants } from './button';
import { badgeVariants } from './badge';
import { cardVariants } from './card';
import { modalVariants } from './modal';
import { inputVariants } from './input';
import { tabsListVariants, tabsTriggerVariants } from './tabs';
import {
  tableWrapperVariants,
  tableVariants,
  tableHeaderVariants,
  tableHeadCellVariants,
  tableRowVariants,
  tableCellVariants,
} from './table';

// Feature: design-system, Property 8: Variant configs use only semantic token classes
describe('Variant configs property tests', () => {
  const hexPattern = /#([0-9a-fA-F]{3}){1,2}\b/;
  const rgbPattern = /rgba?\s*\(/;

  const allVariantConfigs = [
    { name: 'buttonVariants', config: buttonVariants },
    { name: 'badgeVariants', config: badgeVariants },
    { name: 'cardVariants', config: cardVariants },
    { name: 'modalVariants', config: modalVariants },
    { name: 'inputVariants', config: inputVariants },
    { name: 'tabsListVariants', config: tabsListVariants },
    { name: 'tabsTriggerVariants', config: tabsTriggerVariants },
    { name: 'tableWrapperVariants', config: tableWrapperVariants },
    { name: 'tableVariants', config: tableVariants },
    { name: 'tableHeaderVariants', config: tableHeaderVariants },
    { name: 'tableHeadCellVariants', config: tableHeadCellVariants },
    { name: 'tableRowVariants', config: tableRowVariants },
    { name: 'tableCellVariants', config: tableCellVariants },
  ];

  /**
   * **Validates: Requirements 12.2**
   */
  it('Property 8: No variant config contains hardcoded hex color values', () => {
    for (const { name, config } of allVariantConfigs) {
      const variants = config.variants;
      for (const [axis, values] of Object.entries(variants)) {
        for (const [key, classString] of Object.entries(values as Record<string, string>)) {
          expect(
            classString,
            `${name}.variants.${axis}.${key} contains a hardcoded hex color`,
          ).not.toMatch(hexPattern);
        }
      }
    }
  });

  /**
   * **Validates: Requirements 12.2**
   */
  it('Property 8: No variant config contains rgb()/rgba() literals', () => {
    for (const { name, config } of allVariantConfigs) {
      const variants = config.variants;
      for (const [axis, values] of Object.entries(variants)) {
        for (const [key, classString] of Object.entries(values as Record<string, string>)) {
          expect(
            classString,
            `${name}.variants.${axis}.${key} contains an rgb/rgba literal`,
          ).not.toMatch(rgbPattern);
        }
      }
    }
  });
});
