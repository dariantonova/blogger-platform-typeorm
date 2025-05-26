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
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request';
import { Response } from 'express';
import { LoginSuccessViewDto } from '../../user-accounts/api/view-dto/login-success.view-dto';
import { AuthTokensDto } from '../../user-accounts/dto/auth-tokens.dto';
import { LocalAuthGuardSql } from '../guards/local/local-auth.guard.sql';
import { UserContextDtoSql } from '../guards/dto/user-context.dto.sql';
import { LoginUserCommandSql } from '../application/usecases/login-user.usecase.sql';
import { MeViewDtoSql } from './view-dto/users.view-dto.sql';
import { JwtAccessAuthGuardSql } from '../guards/bearer/jwt-access-auth.guard.sql';
import { MeQuerySql } from '../application/queries/me.query.sql';
import { CreateUserInputDto } from '../../user-accounts/api/input-dto/create-user.input-dto';
import { RegisterUserCommandSql } from '../application/usecases/register-user.usecase.sql';
import { RegistrationEmailResendingInputDto } from '../../user-accounts/api/input-dto/registration-email-resending.input-dto';
import { ResendRegistrationEmailCommandSql } from '../application/usecases/resend-registration-email.usecase.sql';
import { RegistrationConfirmationCodeInputDto } from '../../user-accounts/api/input-dto/registration-confirmation-code.input-dto';
import { ConfirmRegistrationCommandSql } from '../application/usecases/confirm-registration.usecase.sql';

@UseGuards(ThrottlerGuard)
@Controller('sql/auth')
export class AuthControllerSql {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuardSql)
  async login(
    @ExtractUserFromRequest() user: UserContextDtoSql,
    @Ip() ip: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<LoginSuccessViewDto> {
    const result = await this.commandBus.execute<
      LoginUserCommandSql,
      AuthTokensDto
    >(
      new LoginUserCommandSql({
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
  @UseGuards(JwtAccessAuthGuardSql)
  @SkipThrottle()
  async me(
    @ExtractUserFromRequest() user: UserContextDtoSql,
  ): Promise<MeViewDtoSql> {
    return this.queryBus.execute(new MeQuerySql(user.id));
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: CreateUserInputDto): Promise<void> {
    await this.commandBus.execute(new RegisterUserCommandSql(body));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new ResendRegistrationEmailCommandSql(body.email),
    );
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(
    @Body() body: RegistrationConfirmationCodeInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new ConfirmRegistrationCommandSql(body.code));
  }

  // @Post('password-recovery')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async recoverPassword(@Body() body: PasswordRecoveryInputDto): Promise<void> {
  //   await this.commandBus.execute(new RecoverPasswordCommand(body.email));
  // }
  //
  // @Post('new-password')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async setNewPassword(
  //   @Body() body: NewPasswordRecoveryInputDto,
  // ): Promise<void> {
  //   await this.commandBus.execute(
  //     new SetNewPasswordCommand(body.newPassword, body.recoveryCode),
  //   );
  // }
  //
  // @Post('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtRefreshAuthGuard)
  // @SkipThrottle()
  // async refreshToken(
  //   @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  //   @Ip() ip: string | undefined,
  //   @Res({ passthrough: true })
  //     response: Response,
  // ): Promise<LoginSuccessViewDto> {
  //   const result = await this.commandBus.execute<
  //     RefreshTokenCommand,
  //     AuthTokensDto
  //   >(
  //     new RefreshTokenCommand({
  //       userId: user.userId,
  //       deviceId: user.deviceId,
  //       ip: ip || 'unknown',
  //     }),
  //   );
  //
  //   this.setRefreshTokenCookie(
  //     response,
  //     result.refreshToken,
  //     result.refreshTokenExpiresAt,
  //   );
  //
  //   return { accessToken: result.accessToken };
  // }
  //
  // @Post('logout')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtRefreshAuthGuard)
  // @SkipThrottle()
  // async logout(
  //   @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  // ): Promise<void> {
  //   await this.commandBus.execute(
  //     new LogoutUserCommand({ deviceId: user.deviceId }),
  //   );
  // }
  //
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
