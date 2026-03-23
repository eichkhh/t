import { Module } from '@nestjs/common';
import { UserServiceConfigModule } from '../config/config.module';
import { EVENT_PUBLISHER } from '../outbox/interfaces/event-publisher.interface';
import { RabbitConnectionService } from './rabbit-connection.service';
import { RabbitPublisherService } from './rabbit-publisher.service';

@Module({
  imports: [UserServiceConfigModule],
  providers: [
    RabbitConnectionService,
    RabbitPublisherService,
    { provide: EVENT_PUBLISHER, useExisting: RabbitPublisherService },
  ],
  exports: [EVENT_PUBLISHER],
})
export class RabbitMQModule {}
