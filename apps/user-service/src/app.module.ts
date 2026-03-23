import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObrioCommonModule, validateEnv } from '@shared/common';
import { join } from 'path';
import { UserServiceConfigModule } from './config/config.module';
import { UserServiceEnvironmentVariables } from './config/env.validation';
import { UserServiceConfigService } from './config/user-service-config.service';
import { HealthController } from './health/health.controller';
import { OutboxEvent } from './outbox/entities/outbox-event.entity';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) =>
        validateEnv(config, UserServiceEnvironmentVariables),
    }),
    ScheduleModule.forRoot(),
    ObrioCommonModule.forRoot('user-service'),
    UserServiceConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [UserServiceConfigModule],
      inject: [UserServiceConfigService],
      useFactory: (cfg: UserServiceConfigService) => ({
        type: 'postgres',
        host: cfg.postgresHost,
        port: cfg.postgresPort,
        username: cfg.postgresUser,
        password: cfg.postgresPassword,
        database: cfg.postgresDb,
        entities: [User, OutboxEvent],
        synchronize: false,
        migrations: [
          join(__dirname, 'migrations', '*.ts'),
          join(__dirname, 'migrations', '*'),
        ],
        migrationsRun: true,
        logging: cfg.typeormLogging,
      }),
    }),
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
