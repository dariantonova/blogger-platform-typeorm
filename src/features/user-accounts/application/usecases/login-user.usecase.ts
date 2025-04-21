import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { RefreshJWTPayload } from '../../dto/refresh-jwt-payload';
import { randomUUID } from 'node:crypto';
import {
  DeviceAuthSession,
  DeviceAuthSessionModelType,
} from '../../domain/device-auth-session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { unixToDate } from '../../../../common/utils/date.util';
import { DeviceAuthSessionsRepository } from '../../infrastructure/device-auth-sessions.repository';

export class LoginUserCommand {
  constructor(public dto: { userId: string; deviceName: string; ip: string }) {}
}

export class LoginResultDto {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements ICommandHandler<LoginUserCommand, LoginResultDto>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    @InjectModel(DeviceAuthSession.name)
    private DeviceAuthSessionModel: DeviceAuthSessionModelType,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepository,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<LoginResultDto> {
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
    userId: string,
    expUnix: number,
    iatUnix: number,
    deviceName: string,
    ip: string,
  ): Promise<void> {
    const deviceAuthSession = this.DeviceAuthSessionModel.createInstance({
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
