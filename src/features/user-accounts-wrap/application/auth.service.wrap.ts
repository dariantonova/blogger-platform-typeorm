import { Injectable } from '@nestjs/common';
import { unixToDate } from '../../../common/utils/date.util';
import { UsersRepositoryWrap } from '../infrastructure/users.repository.wrap';
import { DeviceAuthSessionsRepositoryWrap } from '../infrastructure/device-auth-sessions.repository.wrap';
import { CryptoService } from '../../user-accounts/application/crypto.service';
import { UserContextDtoSql } from '../../user-accounts-sql/guards/dto/user-context.dto.sql';
import { AccessJwtPayloadSql } from '../../user-accounts-sql/dto/access-jwt-payload.sql';
import { RefreshJWTPayloadSql } from '../../user-accounts-sql/dto/refresh-jwt-payload.sql';
import { DeviceAuthSessionContextDtoSql } from '../../user-accounts-sql/guards/dto/device-auth-session-context.dto.sql';

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
      await this.deviceAuthSessionsRepository.findByDeviceIdAndIatAndUserId(
        payload.deviceId,
        unixToDate(payload.iat),
        payload.userId,
      );
    if (!deviceAuthSession) {
      return null;
    }

    return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
