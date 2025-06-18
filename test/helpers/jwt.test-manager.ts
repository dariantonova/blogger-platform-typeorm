import { JwtService } from '@nestjs/jwt';
import { RefreshJwtPayloadDto } from '../../src/features/user-accounts/dto/refresh-jwt-payload.dto';

export class JwtTestManager {
  constructor(private refreshTokenContext: JwtService) {}

  extractDeviceIdFromRefreshToken(refreshToken: string): string {
    const refreshTokenPayload: RefreshJwtPayloadDto =
      this.refreshTokenContext.decode(refreshToken);
    return refreshTokenPayload.deviceId;
  }
}
