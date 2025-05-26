import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CoreConfig } from '../../../../core/core.config';
import { Request } from 'express';
import { AuthServiceSql } from '../../application/auth.service.sql';
import { RefreshJWTPayloadSql } from '../../dto/refresh-jwt-payload.sql';
import { DeviceAuthSessionContextDtoSql } from '../dto/device-auth-session-context.dto.sql';

@Injectable()
export class JwtRefreshStrategySql extends PassportStrategy(
  Strategy,
  'jwt-refresh-token-sql',
) {
  constructor(
    private authService: AuthServiceSql,
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
    payload: RefreshJWTPayloadSql,
  ): Promise<DeviceAuthSessionContextDtoSql> {
    const session =
      await this.authService.validateSessionFromRefreshToken(payload);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    return session;
  }
}
