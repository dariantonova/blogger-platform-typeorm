import { Injectable } from '@nestjs/common';
import { unixToDate } from '../../../common/utils/date.util';
import { UsersRepository } from '../infrastructure/users.repository';
import { DeviceAuthSessionsRepository } from '../infrastructure/device-auth-sessions.repository';
import { CryptoService } from '../../user-accounts/application/crypto.service';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { AccessJwtPayloadDto } from '../dto/access-jwt-payload.dto';
import { RefreshJwtPayloadDto } from '../dto/refresh-jwt-payload.dto';
import { DeviceAuthSessionContextDto } from '../guards/dto/device-auth-session-context.dto';

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
