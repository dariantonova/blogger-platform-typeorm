import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { LocalAuthGuard } from './guards/local/local-auth.guard';
import { JwtAccessAuthGuard } from './guards/bearer/jwt-access-auth.guard';
import { JwtRefreshAuthGuard } from './guards/refresh-token/jwt-refresh-auth.guard';
import { LoginSuccessViewDto } from './view-dto/login-success.view-dto';
import { AuthTokensDto } from '../dto/auth-tokens.dto';
import { MeViewDto } from './view-dto/user.view-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { RegistrationConfirmationCodeInputDto } from './input-dto/registration-confirmation-code.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { NewPasswordRecoveryInputDto } from './input-dto/new-password-recovery.input-dto';
import { ExtractUserFromRequest } from './guards/decorators/param/extract-user-from-request';
import { UserContextDto } from './guards/dto/user-context.dto';
import { DeviceAuthSessionContextDto } from './guards/dto/device-auth-session-context.dto';
import { LogoutUserCommand } from '../application/usecases/logout-user.usecase';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { MeQuery } from '../application/queries/me.query';
import { RegisterUserCommand } from '../application/usecases/register-user.usecase';
import { ResendRegistrationEmailCommand } from '../application/usecases/resend-registration-email.usecase';
import { ConfirmRegistrationCommand } from '../application/usecases/confirm-registration.usecase';
import { RecoverPasswordCommand } from '../application/usecases/recover-password.usecase';
import { SetNewPasswordCommand } from '../application/usecases/set-new-password.usecase';
import { RefreshTokenCommand } from '../application/usecases/refresh-token.usecase';

@UseGuards(ThrottlerGuard)
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
    const result = await this.commandBus.execute<
      LoginUserCommand,
      AuthTokensDto
    >(
      new LoginUserCommand({
        userId: user.id,
        deviceName: userAgent || 'unknown',
        ip: ip || 'unknown',
      }),
    );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );

    return { accessToken: result.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAccessAuthGuard)
  @SkipThrottle()
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

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  @SkipThrottle()
  async refreshToken(
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
    @Ip() ip: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginSuccessViewDto> {
    const result = await this.commandBus.execute<
      RefreshTokenCommand,
      AuthTokensDto
    >(
      new RefreshTokenCommand({
        userId: user.userId,
        deviceId: user.deviceId,
        ip: ip || 'unknown',
      }),
    );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );

    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  @SkipThrottle()
  async logout(
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.commandBus.execute(
      new LogoutUserCommand({
        deviceId: user.deviceId,
        userId: user.userId,
      }),
    );

    this.deleteRefreshTokenCookie(response);
  }

  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
    expires: Date,
  ): void {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      expires,
    });
  }

  private deleteRefreshTokenCookie(response: Response): void {
    response.cookie('refreshToken', '', { expires: new Date(0) });
  }
}
