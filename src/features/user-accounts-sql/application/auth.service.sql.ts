import { Injectable } from '@nestjs/common';
import { CryptoService } from '../../user-accounts/application/crypto.service';
import { UsersRepositorySql } from '../infrastructure/users.repository.sql';
import { DeviceAuthSessionsRepositorySql } from '../infrastructure/device-auth-sessions.repository.sql';
import { UserContextDtoSql } from '../guards/dto/user-context.dto.sql';
import { AccessJwtPayloadSql } from '../dto/access-jwt-payload.sql';
import { RefreshJWTPayloadSql } from '../dto/refresh-jwt-payload.sql';
import { DeviceAuthSessionContextDtoSql } from '../guards/dto/device-auth-session-context.dto.sql';
import { unixToDate } from '../../../common/utils/date.util';

@Injectable()
export class AuthServiceSql {
  constructor(
    private usersRepository: UsersRepositorySql,
    private cryptoService: CryptoService,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositorySql,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDtoSql | null> {
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
    payload: AccessJwtPayloadSql,
  ): Promise<UserContextDtoSql | null> {
    const user = await this.usersRepository.findById(payload.userId);
    if (!user) {
      return null;
    }

    return { id: payload.userId };
  }

  async validateSessionFromRefreshToken(
    payload: RefreshJWTPayloadSql,
  ): Promise<DeviceAuthSessionContextDtoSql | null> {
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
