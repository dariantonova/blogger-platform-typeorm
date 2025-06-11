import { Injectable } from '@nestjs/common';
import { unixToDate } from '../../../common/utils/date.util';
import { UsersRepositoryWrap } from '../infrastructure/users.repository.wrap';
import { DeviceAuthSessionsRepositoryWrap } from '../infrastructure/device-auth-sessions.repository.wrap';
import { CryptoService } from '../../user-accounts/application/crypto.service';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { AccessJwtPayload } from '../../user-accounts/dto/access-jwt-payload';
import { RefreshJWTPayload } from '../../user-accounts/dto/refresh-jwt-payload';
import { DeviceAuthSessionContextDto } from '../../user-accounts/guards/dto/device-auth-session-context.dto';

@Injectable()
export class AuthServiceWrap {
  constructor(
    private usersRepository: UsersRepositoryWrap,
    private cryptoService: CryptoService,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositoryWrap,
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

    return { id: user.id.toString() };
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
