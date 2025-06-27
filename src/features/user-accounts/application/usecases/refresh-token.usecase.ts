import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { unixToDate } from '../../../../common/utils/date.util';
import { AuthTokensDto } from '../../dto/auth-tokens.dto';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { RefreshJwtPayloadDto } from '../../dto/refresh-jwt-payload.dto';
import { DeviceAuthSessionsRepo } from '../../infrastructure/device-auth-sessions.repo';

export class RefreshTokenCommand {
  constructor(public dto: { userId: number; deviceId: string; ip: string }) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand, AuthTokensDto>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepo,
  ) {}

  async execute({ dto }: RefreshTokenCommand): Promise<AuthTokensDto> {
    const accessToken = this.accessTokenContext.sign({ userId: dto.userId });
    const refreshToken = this.refreshTokenContext.sign({
      userId: dto.userId,
      deviceId: dto.deviceId,
    });

    const refreshTokenPayload: RefreshJwtPayloadDto =
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
