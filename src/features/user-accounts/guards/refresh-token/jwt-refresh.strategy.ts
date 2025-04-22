import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CoreConfig } from '../../../../core/core.config';
import { Request } from 'express';
import { RefreshJWTPayload } from '../../dto/refresh-jwt-payload';
import { DeviceAuthSessionContextDto } from '../dto/device-auth-session-context.dto';
import { AuthService } from '../../application/auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private authService: AuthService,
    coreConfig: CoreConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.['refresh-token'],
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
