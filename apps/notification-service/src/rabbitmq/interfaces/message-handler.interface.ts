export const MESSAGE_HANDLERS = Symbol('MESSAGE_HANDLERS');

export interface IMessageHandler {
  readonly eventType: string;
  handle(payload: unknown): Promise<void>;
}
