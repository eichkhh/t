import { Module } from '@nestjs/common';
import { NotificationServiceConfigService } from './notification-service-config.service';

@Module({
  providers: [NotificationServiceConfigService],
  exports: [NotificationServiceConfigService],
})
export class NotificationServiceConfigModule {}
