import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  AppLogger,
  CorrelationMiddleware,
  registerGracefulShutdown,
} from '@shared/common';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { UserServiceConfigService } from './config/user-service-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(AppLogger);
  const configService = app.get(UserServiceConfigService);

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

  const grpcPort = configService.grpcPort;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, '..', 'proto', 'user-service.proto'),
      url: `0.0.0.0:${grpcPort}`,
    },
  });

  registerGracefulShutdown(app, logger);

  await app.startAllMicroservices();
  const port = configService.httpPort;
  await app.listen(port, '0.0.0.0');
  logger.log(`HTTP :${port} gRPC :${grpcPort}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
