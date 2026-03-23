import { Injectable } from '@nestjs/common';
import { injectOtelContext } from '@shared/common';
import { OutboxEventType } from '@shared/contracts';
import type { IEventPublisher } from '../outbox/interfaces/event-publisher.interface';
import type { OutboxRow } from '../outbox/interfaces/outbox-row.interface';
import { RabbitConnectionService } from './rabbit-connection.service';
import { EVENT_ROUTES } from './routes/event-routes';

@Injectable()
export class RabbitPublisherService implements IEventPublisher {
  constructor(private readonly rabbitConnection: RabbitConnectionService) {}

  async publish(row: OutboxRow): Promise<void> {
    const route = EVENT_ROUTES[row.type as OutboxEventType];
    if (!route) {
      throw new Error(`No AMQP route defined for event type: ${row.type}`);
    }

    await this.rabbitConnection.channelWrapper.publish(
      route.exchange,
      route.routingKey,
      { eventType: row.type, payload: row.payloadJson },
      {
        persistent: true,
        contentType: 'application/json',
        headers: injectOtelContext(),
      },
    );
  }
}
