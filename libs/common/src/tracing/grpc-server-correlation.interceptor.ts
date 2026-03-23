import { Metadata } from '@grpc/grpc-js';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, firstValueFrom, from } from 'rxjs';
import { runWithCorrelation } from '../context/correlation-context';

@Injectable()
export class GrpcServerCorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = context.switchToRpc().getContext<Metadata>();
    const values = metadata.get('x-correlation-id');
    const correlationId =
      typeof values[0] === 'string' ? values[0] : randomUUID();

    return from(
      runWithCorrelation(correlationId, () => firstValueFrom(next.handle())),
    );
  }
}
