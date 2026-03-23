import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ObrioCommonModule, validateEnv } from '@shared/common';
import { WELCOME_QUEUE } from '@shared/contracts';
import { NotificationServiceConfigModule } from './config/config.module';
import { NotificationServiceEnvironmentVariables } from './config/env.validation';
import { NotificationServiceConfigService } from './config/notification-service-config.service';
import { HealthController } from './health/health.controller';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) =>
        validateEnv(config, NotificationServiceEnvironmentVariables),
    }),
    ObrioCommonModule.forRoot('notification-service'),
    NotificationServiceConfigModule,
    BullModule.forRootAsync({
      imports: [NotificationServiceConfigModule],
      inject: [NotificationServiceConfigService],
      useFactory: (cfg: NotificationServiceConfigService) => ({
        connection: {
          host: cfg.redisHost,
          port: cfg.redisPort,
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: WELCOME_QUEUE,
      adapter: BullMQAdapter,
    }),
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
