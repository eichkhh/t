import { Module } from '@nestjs/common';
import { NotificationServiceConfigModule } from '../config/config.module';
import { RabbitConnectionService } from './rabbit-connection.service';

@Module({
  imports: [NotificationServiceConfigModule],
  providers: [RabbitConnectionService],
  exports: [RabbitConnectionService],
})
export class RabbitMQModule {}
