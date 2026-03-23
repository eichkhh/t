import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { WELCOME_QUEUE } from '@shared/contracts';
import { NotificationServiceConfigModule } from '../config/config.module';
import {
  MESSAGE_HANDLERS,
  type IMessageHandler,
} from '../rabbitmq/interfaces/message-handler.interface';
import { MessageHandlerRegistry } from '../rabbitmq/message-handler.registry';
import { RabbitConsumerService } from '../rabbitmq/rabbit-consumer.service';
import { RabbitMQModule } from '../rabbitmq/rabbit-mq.module';
import { UserRegisteredHandler } from './handlers/user-registered.handler';
import { PUSH_SERVICE } from './interfaces/push.interface';
import { WelcomeProcessor } from './processors/welcome.processor';
import { PushHttpClient } from './providers/push-http.client';
import { WebhookPushService } from './providers/webhook-push.service';

@Module({
  imports: [
    HttpModule,
    NotificationServiceConfigModule,
    RabbitMQModule,
    BullModule.registerQueue({ name: WELCOME_QUEUE }),
  ],
  providers: [
    PushHttpClient,
    WebhookPushService,
    { provide: PUSH_SERVICE, useExisting: WebhookPushService },
    WelcomeProcessor,
    UserRegisteredHandler,
    {
      provide: MESSAGE_HANDLERS,
      useFactory: (
        userRegistered: UserRegisteredHandler,
      ): IMessageHandler[] => [userRegistered],
      inject: [UserRegisteredHandler],
    },
    MessageHandlerRegistry,
    RabbitConsumerService,
  ],
})
export class NotificationsModule {}
