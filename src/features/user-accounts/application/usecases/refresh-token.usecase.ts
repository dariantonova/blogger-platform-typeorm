import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { DeviceAuthSessionsRepository } from '../../infrastructure/device-auth-sessions.repository';
import { AuthTokensDto } from '../../dto/auth-tokens.dto';
import { RefreshJWTPayload } from '../../dto/refresh-jwt-payload';
import { unixToDate } from '../../../../common/utils/date.util';

export class RefreshTokenCommand {
  constructor(public dto: { userId: string; deviceId: string; ip: string }) {}
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
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepository,
  ) {}

  async execute({ dto }: RefreshTokenCommand): Promise<AuthTokensDto> {
    const accessToken = this.accessTokenContext.sign({ userId: dto.userId });
    const refreshToken = this.refreshTokenContext.sign({
      userId: dto.userId,
      deviceId: dto.deviceId,
    });

    const refreshTokenPayload: RefreshJWTPayload =
      this.refreshTokenContext.decode(refreshToken);

    await this.updateDeviceAuthSession(
      dto.deviceId,
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
    expUnix: number,
    iatUnix: number,
    ip: string,
  ): Promise<void> {
    const deviceAuthSession =
      await this.deviceAuthSessionsRepository.findByDeviceIdOrInternalFail(
        deviceId,
      );

    deviceAuthSession.update({
      exp: unixToDate(expUnix),
      iat: unixToDate(iatUnix),
      ip,
    });

    await this.deviceAuthSessionsRepository.save(deviceAuthSession);
  }
}
