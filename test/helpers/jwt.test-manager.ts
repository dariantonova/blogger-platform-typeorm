import { JwtService } from '@nestjs/jwt';
import { RefreshJWTPayload } from '../../src/features/user-accounts/dto/refresh-jwt-payload';

export class JwtTestManager {
  constructor(private refreshTokenContext: JwtService) {}

  extractDeviceIdFromRefreshToken(refreshToken: string): string {
    const refreshTokenPayload: RefreshJWTPayload =
      this.refreshTokenContext.decode(refreshToken);
    return refreshTokenPayload.deviceId;
  }
}
