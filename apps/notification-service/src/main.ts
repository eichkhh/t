import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  AppLogger,
  CorrelationMiddleware,
  registerGracefulShutdown,
} from '@shared/common';
import { AppModule } from './app.module';
import { NotificationServiceConfigService } from './config/notification-service-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  const configService = app.get(NotificationServiceConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const correlationMiddleware = new CorrelationMiddleware();
  app.use(correlationMiddleware.use.bind(correlationMiddleware));

  registerGracefulShutdown(app, logger);

  const port = configService.httpPort;
  await app.listen(port, '0.0.0.0');
  logger.log(`HTTP :${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
