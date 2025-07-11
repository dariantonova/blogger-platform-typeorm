import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from '../common/utils/config-validation.utility';

export class DbConfig {
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

  private initializeConfigValues() {
    this.pgHost = process.env.PG_HOST as string;

    this.pgPort = configValidationUtility.convertToNumber(
      process.env.PG_PORT,
    ) as number;

    this.pgUsername = process.env.PG_USERNAME as string;

    this.pgPassword = process.env.PG_PASSWORD as string;

    this.pgDbName = process.env.PG_DB_NAME as string;

    this.dbLogging = configValidationUtility.convertToBoolean(
      process.env.DB_LOGGING,
    ) as boolean;

    this.dbAutosync = configValidationUtility.convertToBoolean(
      process.env.DB_AUTOSYNC,
    ) as boolean;

    this.dbUseSsl = configValidationUtility.convertToBoolean(
      process.env.DB_USE_SSL,
    ) as boolean;
  }

  constructor() {
    this.initializeConfigValues();
    configValidationUtility.validateConfig(this);
  }
}
