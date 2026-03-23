import { Inject, Injectable } from '@nestjs/common';
import { injectOtelContext } from '@shared/common';
import type { OutboxEventType } from '@shared/contracts';
import { OutboxStatus } from './enums/outbox-status.enum';
import type { IOutboxRepository } from './interfaces/outbox-repository.interface';
import { OUTBOX_REPOSITORY } from './interfaces/outbox-repository.interface';
import type { ITransactionalEventPublisher } from './interfaces/transactional-event-publisher.interface';

@Injectable()
export class OutboxEventPublisher implements ITransactionalEventPublisher {
  constructor(
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepo: IOutboxRepository,
  ) {}

  async publish(type: OutboxEventType, payload: unknown): Promise<void> {
    await this.outboxRepo.create({
      type,
      payloadJson: payload,
      metadata: { otelCarrier: injectOtelContext() },
      status: OutboxStatus.PENDING,
      attempts: 0,
      processedAt: null,
    });
  }
}
