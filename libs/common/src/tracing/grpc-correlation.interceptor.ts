import { InterceptingCall, InterceptorOptions, NextCall } from '@grpc/grpc-js';
import { getCorrelationId } from '../context/correlation-context';

export function grpcCorrelationInterceptor(
  options: InterceptorOptions,
  nextCall: NextCall,
): InterceptingCall {
  return new InterceptingCall(nextCall(options), {
    start: (metadata, listener, next) => {
      const correlationId = getCorrelationId();
      if (correlationId) {
        metadata.set('x-correlation-id', correlationId);
      }
      next(metadata, listener);
    },
  });
}
