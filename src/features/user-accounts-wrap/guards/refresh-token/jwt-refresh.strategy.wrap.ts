import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CoreConfig } from '../../../../core/core.config';
import { Request } from 'express';
import { AuthServiceWrap } from '../../application/auth.service.wrap';
import { RefreshJWTPayload } from '../../../user-accounts/dto/refresh-jwt-payload';
import { DeviceAuthSessionContextDto } from '../../../user-accounts/guards/dto/device-auth-session-context.dto';

@Injectable()
export class JwtRefreshStrategyWrap extends PassportStrategy(
  Strategy,
  'jwt-refresh-wrap',
) {
  constructor(
    private authService: AuthServiceWrap,
    coreConfig: CoreConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.refreshToken,
      ]),
      secretOrKey: coreConfig.refreshJwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(
    payload: RefreshJWTPayload,
  ): Promise<DeviceAuthSessionContextDto> {
    const session =
      await this.authService.validateSessionFromRefreshToken(payload);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    return session;
  }
}
