import type { OutboxRow } from './outbox-row.interface';

export const EVENT_PUBLISHER = Symbol('IEventPublisher');

export interface IEventPublisher {
  publish(row: OutboxRow): Promise<void>;
}
