export const PUSH_SERVICE = Symbol('IPushService');

export interface IPushService {
  sendWelcome(userId: string, name: string): Promise<void>;
}
