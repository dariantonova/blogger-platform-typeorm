import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { unixToDate } from '../../../../common/utils/date.util';
import { AuthTokensDto } from '../../dto/auth-tokens.dto';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { RefreshJwtPayloadDto } from '../../dto/refresh-jwt-payload.dto';
import { DeviceAuthSession } from '../../domain/device-auth-session.entity';
import { DeviceAuthSessionsRepo } from '../../infrastructure/device-auth-sessions.repo';

export class LoginUserCommand {
  constructor(public dto: { userId: number; deviceName: string; ip: string }) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements ICommandHandler<LoginUserCommand, AuthTokensDto>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepo,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<AuthTokensDto> {
    const accessToken = this.accessTokenContext.sign({ userId: dto.userId });

    const deviceId = randomUUID();
    const refreshToken = this.refreshTokenContext.sign({
      userId: dto.userId,
      deviceId,
    });

    const refreshTokenPayload: RefreshJwtPayloadDto =
      this.refreshTokenContext.decode(refreshToken);

    await this.createDeviceAuthSession(
      deviceId,
      dto.userId,
      refreshTokenPayload.exp,
      refreshTokenPayload.iat,
      dto.deviceName,
      dto.ip,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: unixToDate(refreshTokenPayload.exp),
    };
  }

  private async createDeviceAuthSession(
    deviceId: string,
    userId: number,
    expUnix: number,
    iatUnix: number,
    deviceName: string,
    ip: string,
  ): Promise<void> {
    const deviceAuthSession = DeviceAuthSession.createInstance({
      deviceId,
      userId,
      exp: unixToDate(expUnix),
      iat: unixToDate(iatUnix),
      deviceName,
      ip,
    });

    await this.deviceAuthSessionsRepository.save(deviceAuthSession);
  }
}
