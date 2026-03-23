import { Injectable } from '@nestjs/common';
import { TypeOrmUnitOfWork } from '@shared/common';
import { OutboxEvent } from '../entities/outbox-event.entity';
import type { IOutboxRepository } from '../interfaces/outbox-repository.interface';

@Injectable()
export class OutboxRepository implements IOutboxRepository {
  constructor(private readonly uow: TypeOrmUnitOfWork) {}

  create(data: Partial<OutboxEvent>): Promise<OutboxEvent> {
    return this.uow.getManager().save(OutboxEvent, data as OutboxEvent);
  }
}
