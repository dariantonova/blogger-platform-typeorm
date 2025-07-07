import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../../common/utils/config-validation.utility';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserAccountsConfig {
  @IsBoolean({
    message:
      'Set Env variable IS_USER_AUTOMATICALLY_CONFIRMED, example: true, available values: true, false',
  })
  isUserAutomaticallyConfirmed: boolean;

  @IsNumber(
    {},
    {
      message:
        'Set Env variable EMAIL_CONFIRMATION_CODE_LIFETIME_IN_SECONDS, example: 7200',
    },
  )
  emailConfirmationCodeLifetimeInSeconds: number;

  @IsNumber(
    {},
    {
      message:
        'Set Env variable PASSWORD_RECOVERY_CODE_LIFETIME_IN_SECONDS, example: 3600',
    },
  )
  passwordRecoveryCodeLifetimeInSeconds: number;

  @IsNotEmpty({
    message: 'Set Env variable HTTP_BASIC_USER, example: admin',
  })
  httpBasicUser: string;

  @IsNotEmpty({
    message: 'Set Env variable HTTP_BASIC_PASS, example: 123',
  })
  httpBasicPass: string;

  private initializeConfigValues() {
    this.isUserAutomaticallyConfirmed =
      configValidationUtility.convertToBoolean(
        this.configService.get('IS_USER_AUTOMATICALLY_CONFIRMED'),
      ) as boolean;

    this.emailConfirmationCodeLifetimeInSeconds =
      configValidationUtility.convertToNumber(
        this.configService.get('EMAIL_CONFIRMATION_CODE_LIFETIME_IN_SECONDS'),
      ) as number;

    this.passwordRecoveryCodeLifetimeInSeconds =
      configValidationUtility.convertToNumber(
        this.configService.get('PASSWORD_RECOVERY_CODE_LIFETIME_IN_SECONDS'),
      ) as number;

    this.httpBasicUser = this.configService.get('HTTP_BASIC_USER') as string;

    this.httpBasicPass = this.configService.get('HTTP_BASIC_PASS') as string;
  }

  constructor(private configService: ConfigService) {
    this.initializeConfigValues();
    configValidationUtility.validateConfig(this);
  }
}
