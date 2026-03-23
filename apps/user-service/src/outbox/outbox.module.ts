import { Module } from '@nestjs/common';
import { TypeOrmUnitOfWork, UNIT_OF_WORK } from '@shared/common';
import { UserServiceConfigModule } from '../config/config.module';
import { RabbitMQModule } from '../rabbitmq/rabbit-mq.module';
import { OUTBOX_RELAY_REPOSITORY } from './interfaces/outbox-relay-repository.interface';
import { OUTBOX_REPOSITORY } from './interfaces/outbox-repository.interface';
import { TRANSACTIONAL_EVENT_PUBLISHER } from './interfaces/transactional-event-publisher.interface';
import { OutboxEventPublisher } from './outbox-event.publisher';
import { OutboxRelayCron } from './outbox-relay.cron';
import { OutboxRelayService } from './outbox-relay.service';
import { OutboxRelayRepository } from './repositories/outbox-relay.repository';
import { OutboxRepository } from './repositories/outbox.repository';

@Module({
  imports: [UserServiceConfigModule, RabbitMQModule],
  providers: [
    TypeOrmUnitOfWork,
    { provide: UNIT_OF_WORK, useExisting: TypeOrmUnitOfWork },
    OutboxRepository,
    { provide: OUTBOX_REPOSITORY, useExisting: OutboxRepository },
    OutboxRelayRepository,
    { provide: OUTBOX_RELAY_REPOSITORY, useExisting: OutboxRelayRepository },
    OutboxEventPublisher,
    {
      provide: TRANSACTIONAL_EVENT_PUBLISHER,
      useExisting: OutboxEventPublisher,
    },
    OutboxRelayService,
    OutboxRelayCron,
  ],
  exports: [TypeOrmUnitOfWork, UNIT_OF_WORK, TRANSACTIONAL_EVENT_PUBLISHER],
})
export class OutboxModule {}
