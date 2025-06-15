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
import { LoginUserCommandWrap } from '../application/usecases/login-user.usecase.wrap';
import { MeQueryWrap } from '../application/queries/me.query.wrap';
import { RegisterUserCommandWrap } from '../application/usecases/register-user.usecase.wrap';
import { ResendRegistrationEmailCommandWrap } from '../application/usecases/resend-registration-email.usecase.wrap';
import { ConfirmRegistrationCommandWrap } from '../application/usecases/confirm-registration.usecase.wrap';
import { RecoverPasswordCommandWrap } from '../application/usecases/recover-password.usecase.wrap';
import { SetNewPasswordCommandWrap } from '../application/usecases/set-new-password.usecase.wrap';
import { RefreshTokenCommandWrap } from '../application/usecases/refresh-token.usecase.wrap';
import { LogoutUserCommandWrap } from '../application/usecases/logout-user.usecase.wrap';
import { LocalAuthGuardWrap } from '../guards/local/local-auth.guard.wrap';
import { JwtAccessAuthGuardWrap } from '../guards/bearer/jwt-access-auth.guard.wrap';
import { JwtRefreshAuthGuardWrap } from '../guards/refresh-token/jwt-refresh-auth.guard.wrap';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { LoginSuccessViewDto } from '../../user-accounts/api/view-dto/login-success.view-dto';
import { AuthTokensDto } from '../../user-accounts/dto/auth-tokens.dto';
import { MeViewDto } from '../../user-accounts/api/view-dto/user.view-dto';
import { CreateUserInputDto } from '../../user-accounts/api/input-dto/create-user.input-dto';
import { RegistrationEmailResendingInputDto } from '../../user-accounts/api/input-dto/registration-email-resending.input-dto';
import { RegistrationConfirmationCodeInputDto } from '../../user-accounts/api/input-dto/registration-confirmation-code.input-dto';
import { PasswordRecoveryInputDto } from '../../user-accounts/api/input-dto/password-recovery.input-dto';
import { NewPasswordRecoveryInputDto } from '../../user-accounts/api/input-dto/new-password-recovery.input-dto';
import { DeviceAuthSessionContextDto } from '../../user-accounts/guards/dto/device-auth-session-context.dto';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthControllerWrap {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuardWrap)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Ip() ip: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<LoginSuccessViewDto> {
    const result = await this.commandBus.execute<
      LoginUserCommandWrap,
      AuthTokensDto
    >(
      new LoginUserCommandWrap({
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
  @UseGuards(JwtAccessAuthGuardWrap)
  @SkipThrottle()
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.queryBus.execute(new MeQueryWrap(user.id));
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: CreateUserInputDto): Promise<void> {
    await this.commandBus.execute(new RegisterUserCommandWrap(body));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new ResendRegistrationEmailCommandWrap(body.email),
    );
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(
    @Body() body: RegistrationConfirmationCodeInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new ConfirmRegistrationCommandWrap(body.code),
    );
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoverPassword(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    await this.commandBus.execute(new RecoverPasswordCommandWrap(body.email));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(
    @Body() body: NewPasswordRecoveryInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new SetNewPasswordCommandWrap(body.newPassword, body.recoveryCode),
    );
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuardWrap)
  @SkipThrottle()
  async refreshToken(
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
    @Ip() ip: string | undefined,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<LoginSuccessViewDto> {
    const result = await this.commandBus.execute<
      RefreshTokenCommandWrap,
      AuthTokensDto
    >(
      new RefreshTokenCommandWrap({
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
  @UseGuards(JwtRefreshAuthGuardWrap)
  @SkipThrottle()
  async logout(
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new LogoutUserCommandWrap({
        deviceId: user.deviceId,
        userId: user.userId,
      }),
    );
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
      path: '/',
    });
  }
}
