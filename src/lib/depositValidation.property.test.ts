import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculatePendingBalance,
  checkDepositExcess,
} from '@/lib/depositValidation';

/**
 * Feature: syk-dashboard-ui, Property 19: Cálculo de saldo pendiente y advertencia de exceso
 *
 * Para cualquier pedido con total T y una lista de depósitos con montos [d₁, d₂, ..., dₙ]:
 * - El saldo pendiente SHALL ser igual a T - Σdᵢ (total menos suma de todos los depósitos).
 * - Si un nuevo depósito tiene monto mayor que el saldo pendiente actual, el sistema SHALL señalar exceso.
 * - Si un nuevo depósito tiene monto <= saldo pendiente actual, el sistema NO SHALL señalar exceso.
 * - El total acumulado de depósitos SHALL ser igual a Σdᵢ.
 *
 * **Validates: Requirements 21.4, 21.6**
 */
describe('Feature: syk-dashboard-ui, Property 19: Cálculo de saldo pendiente y advertencia de exceso', () => {
  // Generator: a deposit with positive amount
  const arbDeposit = fc.record({
    id: fc.uuid(),
    amount: fc.integer({ min: 1, max: 100000 }),
    method: fc.constantFrom('transferencia' as const, 'efectivo' as const),
    date: fc
      .record({
        year: fc.integer({ min: 2020, max: 2030 }),
        month: fc.integer({ min: 1, max: 12 }),
        day: fc.integer({ min: 1, max: 28 }),
      })
      .map(
        ({ year, month, day }) =>
          `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      ),
  });

  // Generator: array of deposits
  const arbDeposits = fc.array(arbDeposit, { minLength: 0, maxLength: 10 });

  // Generator: positive order total
  const arbOrderTotal = fc.integer({ min: 1, max: 1000000 });

  it('pending balance equals order total minus sum of deposit amounts', () => {
    fc.assert(
      fc.property(arbOrderTotal, arbDeposits, (orderTotal, deposits) => {
        const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
        const pendingBalance = calculatePendingBalance(orderTotal, deposits);
        expect(pendingBalance).toBe(orderTotal - totalDeposited);
      }),
      { numRuns: 100 }
    );
  });

  it('checkDepositExcess returns true when amount > pending balance', () => {
    fc.assert(
      fc.property(
        arbOrderTotal,
        arbDeposits,
        fc.integer({ min: 1, max: 1000000 }),
        (orderTotal, deposits, extraAmount) => {
          const pendingBalance = calculatePendingBalance(orderTotal, deposits);
          const excessAmount = pendingBalance + extraAmount; // guaranteed > pendingBalance
          expect(checkDepositExcess(excessAmount, pendingBalance)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('checkDepositExcess returns false when amount <= pending balance', () => {
    fc.assert(
      fc.property(arbOrderTotal, arbDeposits, (orderTotal, deposits) => {
        const pendingBalance = calculatePendingBalance(orderTotal, deposits);
        if (pendingBalance <= 0) return; // skip when no positive pending balance

        const safeAmount = fc.sample(
          fc.integer({ min: 1, max: pendingBalance }),
          1
        )[0] as number;
        expect(checkDepositExcess(safeAmount, pendingBalance)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('accumulated total of deposits equals sum of all deposit amounts', () => {
    fc.assert(
      fc.property(arbOrderTotal, arbDeposits, (orderTotal, deposits) => {
        const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
        const pendingBalance = calculatePendingBalance(orderTotal, deposits);
        // totalDeposited + pendingBalance === orderTotal
        expect(totalDeposited + pendingBalance).toBe(orderTotal);
      }),
      { numRuns: 100 }
    );
  });
});
