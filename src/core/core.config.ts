import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../common/utils/config-validation.utility';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export enum Environment {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  @IsEnum(Environment, {
    message:
      'Set Env variable NODE_ENV, available values: ' +
      configValidationUtility.getEnumValuesString(Environment),
  })
  env: Environment;

  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number;

  @IsNotEmpty({
    message: 'Set Env variable PG_HOST, example: localhost',
  })
  pgHost: string;

  @IsNumber(
    {},
    {
      message: 'Set Env variable PG_PORT, example: 5432',
    },
  )
  pgPort: number;

  @IsNotEmpty({
    message: 'Set Env variable PG_USERNAME, example: postgres',
  })
  pgUsername: string;

  @IsNotEmpty({
    message: 'Set Env variable PG_PASSWORD, example: sa',
  })
  pgPassword: string;

  @IsNotEmpty({
    message: 'Set Env variable PG_DB_NAME, example: my_app_db',
  })
  pgDbName: string;

  @IsBoolean({
    message:
      'Set Env variable DB_LOGGING to enable/disable dangerous for production TypeORM SQL query logging, example: true, available values: true, false',
  })
  dbLogging: boolean;

  @IsBoolean({
    message:
      'Set Env variable DB_AUTOSYNC to enable/disable dangerous for production auto synchronization, example: true, available values: true, false',
  })
  dbAutosync: boolean;

  @IsBoolean({
    message:
      'Set Env variable DB_USE_SSL to enable/disable SSL/TLS connection to the database, example: true, available values: true, false',
  })
  dbUseSsl: boolean;

  @IsNotEmpty({
    message:
      'Set Env variable MAIL_TRANSPORT, example: smtps://user@yandex.ru:pass@smtp.yandex.ru',
  })
  mailTransport: string;

  @IsNotEmpty({
    message: 'Set Env variable MAIL_FROM_NAME, example: SenderName',
  })
  mailFromName: string;

  @IsBoolean({
    message:
      'Set Env variable IS_SWAGGER_ENABLED to enable/disable dangerous for production Swagger, example: true, available values: true, false',
  })
  isSwaggerEnabled: boolean;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE to enable/disable dangerous for production TestingModule, example: true, available values: true, false',
  })
  includeTestingModule: boolean;

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_JWT_SECRET, example: mysecretkey123',
  })
  refreshJwtSecret: string;

  @IsNumber(
    {},
    {
      message:
        'Set Env variable REFRESH_TOKEN_LIFETIME_IN_SECONDS, example: 36000',
    },
  )
  refreshTokenLifetimeInSeconds: number;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_JWT_SECRET, example: mysecretkey123',
  })
  accessJwtSecret: string;

  @IsNumber(
    {},
    {
      message:
        'Set Env variable ACCESS_TOKEN_LIFETIME_IN_SECONDS, example: 300',
    },
  )
  accessTokenLifetimeInSeconds: number;

  @IsNumber(
    {},
    {
      message:
        'Set Env variable AUTH_THROTTLE_TTL_IN_MILLISECONDS, example: 10000',
    },
  )
  authThrottleTtlInMilliseconds: number;

  @IsNumber(
    {},
    {
      message: 'Set Env variable AUTH_THROTTLE_LIMIT, example: 5',
    },
  )
  authThrottleLimit: number;

  private initializeConfigValues() {
    this.env = this.configService.get('NODE_ENV') as Environment;

    this.port = configValidationUtility.convertToNumber(
      this.configService.get('PORT'),
    ) as number;

    this.pgHost = this.configService.get('PG_HOST') as string;

    this.pgPort = configValidationUtility.convertToNumber(
      this.configService.get('PG_PORT'),
    ) as number;

    this.pgUsername = this.configService.get('PG_USERNAME') as string;

    this.pgPassword = this.configService.get('PG_PASSWORD') as string;

    this.pgDbName = this.configService.get('PG_DB_NAME') as string;

    this.dbLogging = configValidationUtility.convertToBoolean(
      this.configService.get('DB_LOGGING'),
    ) as boolean;

    this.dbAutosync = configValidationUtility.convertToBoolean(
      this.configService.get('DB_AUTOSYNC'),
    ) as boolean;

    this.dbUseSsl = configValidationUtility.convertToBoolean(
      process.env.DB_USE_SSL,
    ) as boolean;

    this.mailTransport = this.configService.get('MAIL_TRANSPORT') as string;

    this.mailFromName = this.configService.get('MAIL_FROM_NAME') as string;

    this.isSwaggerEnabled = configValidationUtility.convertToBoolean(
      this.configService.get('IS_SWAGGER_ENABLED'),
    ) as boolean;

    this.includeTestingModule = configValidationUtility.convertToBoolean(
      this.configService.get('INCLUDE_TESTING_MODULE'),
    ) as boolean;

    this.accessJwtSecret = this.configService.get(
      'ACCESS_JWT_SECRET',
    ) as string;

    this.accessTokenLifetimeInSeconds = configValidationUtility.convertToNumber(
      this.configService.get('ACCESS_TOKEN_LIFETIME_IN_SECONDS'),
    ) as number;

    this.refreshJwtSecret = this.configService.get(
      'REFRESH_JWT_SECRET',
    ) as string;

    this.refreshTokenLifetimeInSeconds =
      configValidationUtility.convertToNumber(
        this.configService.get('REFRESH_TOKEN_LIFETIME_IN_SECONDS'),
      ) as number;

    this.authThrottleTtlInMilliseconds =
      configValidationUtility.convertToNumber(
        this.configService.get('AUTH_THROTTLE_TTL_IN_MILLISECONDS'),
      ) as number;

    this.authThrottleLimit = configValidationUtility.convertToNumber(
      this.configService.get('AUTH_THROTTLE_LIMIT'),
    ) as number;
  }

  constructor(private configService: ConfigService) {
    this.initializeConfigValues();
    configValidationUtility.validateConfig(this);
  }
}
