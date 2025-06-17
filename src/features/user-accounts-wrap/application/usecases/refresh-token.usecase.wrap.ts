import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { unixToDate } from '../../../../common/utils/date.util';
import { DeviceAuthSessionsRepositoryWrap } from '../../infrastructure/device-auth-sessions.repository.wrap';
import { AuthTokensDto } from '../../../user-accounts/dto/auth-tokens.dto';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../user-accounts/constants/auth-tokens.inject-constants';
import { RefreshJWTPayloadSql } from '../../../user-accounts-sql/dto/refresh-jwt-payload.sql';

export class RefreshTokenCommandWrap {
  constructor(public dto: { userId: number; deviceId: string; ip: string }) {}
}

@CommandHandler(RefreshTokenCommandWrap)
export class RefreshTokenUseCaseWrap
  implements ICommandHandler<RefreshTokenCommandWrap, AuthTokensDto>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositoryWrap,
  ) {}

  async execute({ dto }: RefreshTokenCommandWrap): Promise<AuthTokensDto> {
    const accessToken = this.accessTokenContext.sign({ userId: dto.userId });
    const refreshToken = this.refreshTokenContext.sign({
      userId: dto.userId,
      deviceId: dto.deviceId,
    });

    const refreshTokenPayload: RefreshJWTPayloadSql =
      this.refreshTokenContext.decode(refreshToken);

    await this.updateDeviceAuthSession(
      dto.deviceId,
      dto.userId,
      refreshTokenPayload.exp,
      refreshTokenPayload.iat,
      dto.ip,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: unixToDate(refreshTokenPayload.exp),
    };
  }

  private async updateDeviceAuthSession(
    deviceId: string,
    userId: number,
    expUnix: number,
    iatUnix: number,
    ip: string,
  ): Promise<void> {
    const deviceAuthSession =
      await this.deviceAuthSessionsRepository.findByDeviceIdAndUserIdOrInternalFail(
        deviceId,
        userId,
      );

    deviceAuthSession.update({
      exp: unixToDate(expUnix),
      iat: unixToDate(iatUnix),
      ip,
    });

    await this.deviceAuthSessionsRepository.save(deviceAuthSession);
  }
}
