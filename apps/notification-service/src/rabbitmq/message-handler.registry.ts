import { Inject, Injectable } from '@nestjs/common';
import { AppLogger, ScopedLogger } from '@shared/common';
import {
  MESSAGE_HANDLERS,
  type IMessageHandler,
} from './interfaces/message-handler.interface';

@Injectable()
export class MessageHandlerRegistry {
  private readonly handlerMap: ReadonlyMap<string, IMessageHandler>;
  private readonly logger: ScopedLogger;

  constructor(
    @Inject(MESSAGE_HANDLERS) handlers: IMessageHandler[],
    logger: AppLogger,
  ) {
    this.logger = logger.withContext(MessageHandlerRegistry.name);
    this.handlerMap = new Map(handlers.map((h) => [h.eventType, h]));
  }

  async dispatch(eventType: string, payload: unknown): Promise<void> {
    const handler = this.handlerMap.get(eventType);

    if (!handler) {
      this.logger.warn(`No handler registered for event type: ${eventType}`);
      return;
    }

    await handler.handle(payload);
  }
}
