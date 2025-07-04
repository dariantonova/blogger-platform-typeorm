import { Injectable } from '@nestjs/common';
import { unixToDate } from '../../../common/utils/date.util';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../api/guards/dto/user-context.dto';
import { AccessJwtPayloadDto } from '../dto/access-jwt-payload.dto';
import { RefreshJwtPayloadDto } from '../dto/refresh-jwt-payload.dto';
import { DeviceAuthSessionContextDto } from '../api/guards/dto/device-auth-session-context.dto';
import { DeviceAuthSessionsRepo } from '../infrastructure/device-auth-sessions.repo';
import { UsersRepo } from '../infrastructure/users.repo';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepo,
    private cryptoService: CryptoService,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepo,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      return null;
    }

    const isPasswordCorrect = await this.cryptoService.comparePasswords(
      password,
      user.passwordHash,
    );
    if (!isPasswordCorrect) {
      return null;
    }

    return { id: user.id };
  }

  async validateUserFromAccessToken(
    payload: AccessJwtPayloadDto,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findById(payload.userId);
    if (!user) {
      return null;
    }

    return { id: payload.userId };
  }

  async validateSessionFromRefreshToken(
    payload: RefreshJwtPayloadDto,
  ): Promise<DeviceAuthSessionContextDto | null> {
    const deviceAuthSession =
      await this.deviceAuthSessionsRepository.findByDeviceIdAndIatAndUserId(
        payload.deviceId,
        unixToDate(payload.iat),
        payload.userId,
      );
    if (!deviceAuthSession) {
      return null;
    }

    const user = await this.usersRepository.findById(payload.userId);
    if (!user) {
      return null;
    }

    return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
