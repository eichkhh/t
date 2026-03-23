import { AsyncLocalStorage } from 'node:async_hooks';

export interface CorrelationContext {
  correlationId: string;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

export function runWithCorrelation<T>(correlationId: string, fn: () => T): T {
  return storage.run({ correlationId }, fn);
}

export function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId;
}
