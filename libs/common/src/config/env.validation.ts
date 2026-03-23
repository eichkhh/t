import { plainToInstance } from 'class-transformer';
import { IsEnum, IsOptional, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
}

export class BaseEnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;
}

export function validateEnv<T extends object>(
  config: Record<string, unknown>,
  envClass: new () => T,
): T {
  const validatedConfig = plainToInstance(envClass, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig as object, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed: ${errors
        .map((e) => Object.values(e.constraints || {}).join(', '))
        .join('; ')}`,
    );
  }

  return validatedConfig;
}
