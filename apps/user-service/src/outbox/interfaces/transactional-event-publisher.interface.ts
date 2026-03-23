import type { OutboxEventType } from '@shared/contracts';

export const TRANSACTIONAL_EVENT_PUBLISHER = Symbol(
  'ITransactionalEventPublisher',
);

export interface ITransactionalEventPublisher {
  publish(type: OutboxEventType, payload: unknown): Promise<void>;
}
