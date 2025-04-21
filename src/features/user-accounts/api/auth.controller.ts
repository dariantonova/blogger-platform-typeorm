import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { MeViewDto } from './view-dto/users.view-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { RegistrationConfirmationCodeInputDto } from './input-dto/registration-confirmation-code.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { NewPasswordRecoveryInputDto } from './input-dto/new-password-recovery.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/users/register-user.usecase';
import {
  LoginResultDto,
  LoginUserCommand,
} from '../application/usecases/login-user.usecase';
import { ResendRegistrationEmailCommand } from '../application/usecases/resend-registration-email.usecase';
import { ConfirmRegistrationCommand } from '../application/usecases/confirm-registration.usecase';
import { RecoverPasswordCommand } from '../application/usecases/recover-password.usecase';
import { SetNewPasswordCommand } from '../application/usecases/set-new-password.usecase';
import { MeQuery } from '../application/queries/me.query';
import { Response } from 'express';
import { LoginSuccessViewDto } from './view-dto/login-success.view-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Ip() ip: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<LoginSuccessViewDto> {
    const loginResult = await this.commandBus.execute<
      LoginUserCommand,
      LoginResultDto
    >(
      new LoginUserCommand({
        userId: user.id,
        deviceName: userAgent || 'unknown',
        ip: ip || 'unknown',
      }),
    );

    response.cookie('refreshToken', loginResult.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: loginResult.refreshTokenExpiresAt,
      path: '/auth',
    });

    return { accessToken: loginResult.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.queryBus.execute(new MeQuery(user.id));
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: CreateUserInputDto): Promise<void> {
    await this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new ResendRegistrationEmailCommand(body.email),
    );
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(
    @Body() body: RegistrationConfirmationCodeInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new ConfirmRegistrationCommand(body.code));
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoverPassword(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    await this.commandBus.execute(new RecoverPasswordCommand(body.email));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(
    @Body() body: NewPasswordRecoveryInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new SetNewPasswordCommand(body.newPassword, body.recoveryCode),
    );
  }
}
