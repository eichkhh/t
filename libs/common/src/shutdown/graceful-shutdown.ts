import type { INestApplication } from '@nestjs/common';

const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10_000;

export function registerGracefulShutdown(
  app: INestApplication,
  logger: { log: (m: string) => void; error: (m: string, e?: unknown) => void },
  timeoutMs = DEFAULT_SHUTDOWN_TIMEOUT_MS,
): void {
  app.enableShutdownHooks();

  process.once('SIGTERM', () => {
    logger.log('Received SIGTERM, shutting down gracefully...');
    setTimeout(() => {
      logger.error(`Shutdown timed out after ${timeoutMs}ms, forcing exit`);
      process.exit(1);
    }, timeoutMs).unref();
  });
}
