import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class AlreadyExistsException extends RpcException {
  constructor(message: string) {
    super({ code: status.ALREADY_EXISTS, message });
  }
}
