import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CoreConfig } from '../../../../core/core.config';
import { AuthServiceSql } from '../../application/auth.service.sql';
import { UserContextDtoSql } from '../dto/user-context.dto.sql';
import { AccessJwtPayloadSql } from '../../dto/access-jwt-payload.sql';

@Injectable()
export class JwtAccessStrategySql extends PassportStrategy(
  Strategy,
  'jwt-access-sql',
) {
  constructor(
    private authService: AuthServiceSql,
    coreConfig: CoreConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: coreConfig.accessJwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AccessJwtPayloadSql): Promise<UserContextDtoSql> {
    const user = await this.authService.validateUserFromAccessToken(payload);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
