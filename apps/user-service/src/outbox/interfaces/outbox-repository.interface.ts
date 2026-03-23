import type { OutboxEvent } from '../entities/outbox-event.entity';

export const OUTBOX_REPOSITORY = Symbol('IOutboxRepository');

export interface IOutboxRepository {
  create(data: Partial<OutboxEvent>): Promise<OutboxEvent>;
}
