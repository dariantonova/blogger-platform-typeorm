import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthTokensDto } from '../../../user-accounts/dto/auth-tokens.dto';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../user-accounts/constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { RefreshJWTPayload } from '../../../user-accounts/dto/refresh-jwt-payload';
import { unixToDate } from '../../../../common/utils/date.util';
import { randomUUID } from 'node:crypto';
import { DeviceAuthSessionsRepositorySql } from '../../infrastructure/device-auth-sessions.repository.sql';
import { CreateDeviceAuthSessionRepoDto } from '../../infrastructure/dto/create-device-auth-session.repo-dto';

export class LoginUserCommandSql {
  constructor(public dto: { userId: number; deviceName: string; ip: string }) {}
}

@CommandHandler(LoginUserCommandSql)
export class LoginUserUseCaseSql
  implements ICommandHandler<LoginUserCommandSql, AuthTokensDto>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositorySql,
  ) {}

  async execute({ dto }: LoginUserCommandSql): Promise<AuthTokensDto> {
    const accessToken = this.accessTokenContext.sign({ userId: dto.userId });

    const deviceId = this.generateDeviceId();
    const refreshToken = this.refreshTokenContext.sign({
      userId: dto.userId,
      deviceId,
    });

    const refreshTokenPayload: RefreshJWTPayload =
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
    const deviceAuthSession: CreateDeviceAuthSessionRepoDto = {
      deviceId,
      userId,
      exp: unixToDate(expUnix),
      iat: unixToDate(iatUnix),
      deviceName,
      ip,
    };

    await this.deviceAuthSessionsRepository.createDeviceAuthSession(
      deviceAuthSession,
    );
  }
}
