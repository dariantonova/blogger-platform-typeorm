import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from './config-validation.utility';
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
    message: 'Set Env variable MONGO_URL, example: mongodb://localhost:27017',
  })
  mongoUri: string;

  @IsNotEmpty({
    message: 'Set Env variable DB_NAME, example: my-app-db',
  })
  dbName: string;

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

  private initializeConfigValues() {
    this.env = this.configService.get('NODE_ENV') as Environment;

    this.port = configValidationUtility.convertToNumber(
      this.configService.get('PORT'),
    ) as number;

    this.mongoUri = this.configService.get('MONGO_URI') as string;

    this.dbName = this.configService.get('DB_NAME') as string;

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
  }

  constructor(private configService: ConfigService) {
    this.initializeConfigValues();
    configValidationUtility.validateConfig(this);
  }
}
