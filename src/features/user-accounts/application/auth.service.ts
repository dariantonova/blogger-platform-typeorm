import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { RefreshJWTPayload } from '../dto/refresh-jwt-payload';
import { AccessJwtPayload } from '../dto/access-jwt-payload';
import { DeviceAuthSessionContextDto } from '../guards/dto/device-auth-session-context.dto';
import { DeviceAuthSessionsRepository } from '../infrastructure/device-auth-sessions.repository';
import { unixToDate } from '../../../common/utils/date.util';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepository,
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

    return { id: user._id.toString() };
  }

  async validateUserFromAccessToken(
    payload: AccessJwtPayload,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findById(payload.userId);
    if (!user) {
      return null;
    }

    return { id: payload.userId };
  }

  async validateSessionFromRefreshToken(
    payload: RefreshJWTPayload,
  ): Promise<DeviceAuthSessionContextDto | null> {
    const deviceAuthSession =
      await this.deviceAuthSessionsRepository.findByDeviceIdAndIat(
        payload.deviceId,
        unixToDate(payload.iat),
      );
    if (!deviceAuthSession) {
      return null;
    }

    return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
