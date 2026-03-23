import { DynamicModule, Module } from '@nestjs/common';
import { AppLogger } from './observability/app-logger';
import { AppMetrics } from './observability/app-metrics';

@Module({})
export class ObrioCommonModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: ObrioCommonModule,
      global: true,
      providers: [
        {
          provide: 'SERVICE_NAME',
          useValue: serviceName,
        },
        {
          provide: AppLogger,
          useFactory: () => new AppLogger(serviceName),
        },
        AppMetrics,
      ],
      exports: [AppLogger, AppMetrics, 'SERVICE_NAME'],
    };
  }
}
