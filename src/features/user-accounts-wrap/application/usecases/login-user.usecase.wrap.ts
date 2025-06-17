import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { unixToDate } from '../../../../common/utils/date.util';
import { DeviceAuthSessionsRepositoryWrap } from '../../infrastructure/device-auth-sessions.repository.wrap';
import { DeviceAuthSessionWrap } from '../../domain/device-auth-session.wrap';
import { AuthTokensDto } from '../../../user-accounts/dto/auth-tokens.dto';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../user-accounts/constants/auth-tokens.inject-constants';
import { RefreshJWTPayloadSql } from '../../../user-accounts-sql/dto/refresh-jwt-payload.sql';

export class LoginUserCommandWrap {
  constructor(public dto: { userId: number; deviceName: string; ip: string }) {}
}

@CommandHandler(LoginUserCommandWrap)
export class LoginUserUseCaseWrap
  implements ICommandHandler<LoginUserCommandWrap, AuthTokensDto>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositoryWrap,
  ) {}

  async execute({ dto }: LoginUserCommandWrap): Promise<AuthTokensDto> {
    const accessToken = this.accessTokenContext.sign({ userId: dto.userId });

    const deviceId = this.generateDeviceId();
    const refreshToken = this.refreshTokenContext.sign({
      userId: dto.userId,
      deviceId,
    });

    const refreshTokenPayload: RefreshJWTPayloadSql =
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

  private generateDeviceId(): string {
    return randomUUID();
  }

  private async createDeviceAuthSession(
    deviceId: string,
    userId: number,
    expUnix: number,
    iatUnix: number,
    deviceName: string,
    ip: string,
  ): Promise<void> {
    const deviceAuthSession = DeviceAuthSessionWrap.createInstance({
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
