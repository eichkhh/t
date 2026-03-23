import { status } from '@grpc/grpc-js';
import { Catch, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmRpcExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(TypeOrmRpcExceptionFilter.name);

  catch(exception: QueryFailedError): Observable<never> {
    this.logger.error('Unexpected DB error', exception.stack);
    return throwError(
      () =>
        new RpcException({
          code: status.INTERNAL,
          message: 'Internal server error',
        }),
    );
  }
}
