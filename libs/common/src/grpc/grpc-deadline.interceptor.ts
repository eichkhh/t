import { InterceptingCall, InterceptorOptions, NextCall } from '@grpc/grpc-js';

export const DEFAULT_DEADLINE_MS = 5_000;

export function grpcDeadlineInterceptor(
  timeoutMs: number = DEFAULT_DEADLINE_MS,
) {
  return function (
    options: InterceptorOptions,
    nextCall: NextCall,
  ): InterceptingCall {
    const optionsWithDeadline =
      options.deadline != null
        ? options
        : { ...options, deadline: new Date(Date.now() + timeoutMs) };

    return new InterceptingCall(nextCall(optionsWithDeadline), {});
  };
}
