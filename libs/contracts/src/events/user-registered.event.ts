import { OutboxEventType } from './outbox-event-type.enum.js';
import type { UserRegisteredPayload } from './user-registered.payload.js';

export interface UserRegisteredEvent {
  eventType: typeof OutboxEventType.USER_REGISTERED;
  payload: UserRegisteredPayload;
}
