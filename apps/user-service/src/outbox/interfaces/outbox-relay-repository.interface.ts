import type { OutboxRow } from './outbox-row.interface';

export const OUTBOX_RELAY_REPOSITORY = Symbol('IOutboxRelayRepository');

export interface IOutboxRelayRepository {
  claimPending(limit: number, maxAttempts: number): Promise<OutboxRow[]>;
  markProcessed(id: string): Promise<void>;
  requeue(id: string, maxAttempts: number): Promise<void>;
  recoverStuck(
    processingTtlSeconds: number,
    maxAttempts: number,
  ): Promise<{ id: string }[]>;
}
