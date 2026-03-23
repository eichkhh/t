import {
  OutboxEventType,
  USER_EVENTS_EXCHANGE,
  USER_REGISTERED_ROUTING_KEY,
} from '@shared/contracts';

export type EventRoute = { exchange: string; routingKey: string };

export const EVENT_ROUTES: Record<OutboxEventType, EventRoute> = {
  [OutboxEventType.USER_REGISTERED]: {
    exchange: USER_EVENTS_EXCHANGE,
    routingKey: USER_REGISTERED_ROUTING_KEY,
  },
};
