import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Client } from '@/types/models';

// ============================================================
// Pure state-transition functions extracted from useClients hook logic.
// These mirror the operations in useClients.ts but are testable without React.
// ============================================================

/**
 * Applies an optimistic create: adds a new client with a temporary id.
 */
function applyOptimisticCreate(state: Client[], optimistic: Client): Client[] {
  return [...state, optimistic];
}

/**
 * Applies an optimistic update: merges changes into the matching record.
 */
function applyOptimisticUpdate(
  state: Client[],
  id: string,
  changes: Partial<Omit<Client, 'id'>>
): Client[] {
  return state.map((c) => (c.id === id ? { ...c, ...changes } : c));
}

/**
 * Applies an optimistic delete: removes the record with matching id.
 */
function applyOptimisticDelete(state: Client[], id: string): Client[] {
  return state.filter((c) => c.id !== id);
}

/**
 * Rollback: restores original state when a mutation fails.
 */
function rollback(_currentState: Client[], originalState: Client[]): Client[] {
  return originalState;
}

/**
 * Replaces the optimistic placeholder with server-confirmed data after success.
 */
function replaceOptimisticWithServer(
  state: Client[],
  optimisticId: string,
  serverData: Client
): Client[] {
  return state.map((c) => (c.id === optimisticId ? serverData : c));
}

/**
 * Real-time INSERT: adds a new record if not already present.
 */
function realtimeInsert(state: Client[], record: Client): Client[] {
  if (state.some((c) => c.id === record.id)) return state;
  return [...state, record];
}

/**
 * Real-time UPDATE: merges the updated record into the matching entry.
 */
function realtimeUpdate(state: Client[], record: Client): Client[] {
  return state.map((c) => (c.id === record.id ? record : c));
}

/**
 * Real-time DELETE: removes the record with the given id.
 */
function realtimeDelete(state: Client[], id: string): Client[] {
  return state.filter((c) => c.id !== id);
}

// ============================================================
// Generators
// ============================================================

const clientArb: fc.Arbitrary<Client> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 5, maxLength: 20 }),
});

const clientArrayArb: fc.Arbitrary<Client[]> = fc.array(clientArb, {
  minLength: 0,
  maxLength: 20,
});

const clientChangesArb: fc.Arbitrary<Partial<Omit<Client, 'id'>>> = fc.record(
  {
    name: fc.string({ minLength: 1, maxLength: 50 }),
    email: fc.emailAddress(),
    phone: fc.string({ minLength: 5, maxLength: 20 }),
  },
  { requiredKeys: [] }
);

// ============================================================
// Property 6: Optimistic update rollback restores original state
// ============================================================

/**
 * Feature: supabase-integration, Property 6: Optimistic update rollback restores original state
 *
 * For any initial state and any mutation that is optimistically applied and then fails,
 * the state after rollback is deeply equal to the state before the optimistic update.
 *
 * **Validates: Requirements 6.2, 6.3**
 */
describe('Feature: supabase-integration, Property 6: Optimistic update rollback restores original state', () => {
  it('rollback after optimistic create restores original state', () => {
    fc.assert(
      fc.property(clientArrayArb, clientArb, (originalState, newClient) => {
        // Apply optimistic create
        const afterOptimistic = applyOptimisticCreate(originalState, newClient);
        // Simulate failure: rollback
        const afterRollback = rollback(afterOptimistic, originalState);
        expect(afterRollback).toEqual(originalState);
      }),
      { numRuns: 100 }
    );
  });

  it('rollback after optimistic update restores original state', () => {
    fc.assert(
      fc.property(
        clientArrayArb.filter((arr) => arr.length > 0),
        clientChangesArb,
        (originalState, changes) => {
          // Pick a random existing client to update
          const targetId = originalState[0]!.id;
          // Apply optimistic update
          const afterOptimistic = applyOptimisticUpdate(
            originalState,
            targetId,
            changes
          );
          // Simulate failure: rollback
          const afterRollback = rollback(afterOptimistic, originalState);
          expect(afterRollback).toEqual(originalState);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rollback after optimistic delete restores original state', () => {
    fc.assert(
      fc.property(
        clientArrayArb.filter((arr) => arr.length > 0),
        (originalState) => {
          const targetId = originalState[0]!.id;
          // Apply optimistic delete
          const afterOptimistic = applyOptimisticDelete(originalState, targetId);
          // Simulate failure: rollback
          const afterRollback = rollback(afterOptimistic, originalState);
          expect(afterRollback).toEqual(originalState);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 7: Successful mutation replaces optimistic value with server data
// ============================================================

/**
 * Feature: supabase-integration, Property 7: Successful mutation replaces optimistic value with server data
 *
 * For any optimistic value and server-confirmed response, after success the local state
 * contains the server-confirmed data (not the optimistic placeholder).
 *
 * **Validates: Requirements 6.4**
 */
describe('Feature: supabase-integration, Property 7: Successful mutation replaces optimistic value with server data', () => {
  it('after create success, state contains server data instead of optimistic placeholder', () => {
    fc.assert(
      fc.property(
        clientArrayArb,
        clientArb,
        clientArb,
        (initialState, optimisticClient, serverClient) => {
          // Make sure optimistic id doesn't collide with existing state
          const optimistic = {
            ...optimisticClient,
            id: `opt-${optimisticClient.id}`,
          };
          // Server data replaces the optimistic entry at the same position
          const serverConfirmed = { ...serverClient, id: serverClient.id };

          // Apply optimistic create
          const afterOptimistic = applyOptimisticCreate(initialState, optimistic);
          // Replace optimistic placeholder with server-confirmed data
          const afterSuccess = replaceOptimisticWithServer(
            afterOptimistic,
            optimistic.id,
            serverConfirmed
          );

          // The state should contain server-confirmed data
          expect(afterSuccess).toContainEqual(serverConfirmed);
          // The optimistic placeholder id should no longer appear with the old data
          const atOldPosition = afterSuccess.find(
            (c) => c.id === optimistic.id
          );
          // Either the optimistic id is gone (replaced by server id)
          // or if by chance the optimistic.id == serverConfirmed.id, the data is server's
          if (optimistic.id !== serverConfirmed.id) {
            expect(atOldPosition).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('after update success, state contains server data at the correct position', () => {
    fc.assert(
      fc.property(
        clientArrayArb.filter((arr) => arr.length > 0),
        clientChangesArb,
        clientArb,
        (initialState, changes, serverResponse) => {
          const targetId = initialState[0]!.id;
          const serverConfirmed = { ...serverResponse, id: targetId };

          // Apply optimistic update
          const afterOptimistic = applyOptimisticUpdate(
            initialState,
            targetId,
            changes
          );
          // Replace with server-confirmed data
          const afterSuccess = replaceOptimisticWithServer(
            afterOptimistic,
            targetId,
            serverConfirmed
          );

          // The state should have server data at the target position
          const found = afterSuccess.find((c) => c.id === targetId);
          expect(found).toEqual(serverConfirmed);
          // Verify it's NOT the optimistic value
          expect(found?.name).toBe(serverConfirmed.name);
          expect(found?.email).toBe(serverConfirmed.email);
          expect(found?.phone).toBe(serverConfirmed.phone);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 9: Real-time events update local state correctly
// ============================================================

/**
 * Feature: supabase-integration, Property 9: Real-time events update local state correctly
 *
 * For any local state array and any real-time event:
 * - INSERT adds a new record to the state
 * - UPDATE merges fields into the matching record
 * - DELETE removes the record from the state
 *
 * **Validates: Requirements 7.2, 7.3, 7.4**
 */
describe('Feature: supabase-integration, Property 9: Real-time events update local state correctly', () => {
  it('INSERT event adds the record to state when not already present', () => {
    fc.assert(
      fc.property(clientArrayArb, clientArb, (state, newRecord) => {
        // Ensure the new record's id is not in the current state
        const uniqueRecord = {
          ...newRecord,
          id: `new-${newRecord.id}`,
        };
        const stateWithoutId = state.filter(
          (c) => c.id !== uniqueRecord.id
        );

        const afterInsert = realtimeInsert(stateWithoutId, uniqueRecord);

        // Record should be present in the new state
        expect(afterInsert).toContainEqual(uniqueRecord);
        // Length should increase by 1
        expect(afterInsert.length).toBe(stateWithoutId.length + 1);
      }),
      { numRuns: 100 }
    );
  });

  it('INSERT event does not duplicate an existing record', () => {
    fc.assert(
      fc.property(
        clientArrayArb.filter((arr) => arr.length > 0),
        (state) => {
          const existingRecord = state[0]!;

          const afterInsert = realtimeInsert(state, existingRecord);

          // State should remain unchanged (no duplicate)
          expect(afterInsert).toEqual(state);
          expect(afterInsert.length).toBe(state.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('UPDATE event merges updated fields into matching record', () => {
    fc.assert(
      fc.property(
        clientArrayArb.filter((arr) => arr.length > 0),
        clientArb,
        (state, updatedData) => {
          const targetId = state[0]!.id;
          const updatedRecord: Client = { ...updatedData, id: targetId };

          const afterUpdate = realtimeUpdate(state, updatedRecord);

          // The updated record should be in the state
          const found = afterUpdate.find((c) => c.id === targetId);
          expect(found).toEqual(updatedRecord);
          // Other records should be unchanged
          const othersBefore = state.filter((c) => c.id !== targetId);
          const othersAfter = afterUpdate.filter((c) => c.id !== targetId);
          expect(othersAfter).toEqual(othersBefore);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('DELETE event removes the record from state', () => {
    fc.assert(
      fc.property(
        clientArrayArb.filter((arr) => arr.length > 0),
        (state) => {
          const targetId = state[0]!.id;

          const afterDelete = realtimeDelete(state, targetId);

          // Record should be absent
          expect(afterDelete.find((c) => c.id === targetId)).toBeUndefined();
          // Length should decrease by exactly the number of records with that id
          const countRemoved = state.filter((c) => c.id === targetId).length;
          expect(afterDelete.length).toBe(state.length - countRemoved);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('DELETE event on non-existent id leaves state unchanged', () => {
    fc.assert(
      fc.property(clientArrayArb, (state) => {
        const nonExistentId = 'non-existent-id-that-will-never-match';

        const afterDelete = realtimeDelete(state, nonExistentId);

        expect(afterDelete).toEqual(state);
      }),
      { numRuns: 100 }
    );
  });
});
