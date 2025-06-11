import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { CoreConfig } from '../../../../core/core.config';
import { AuthServiceWrap } from '../../application/auth.service.wrap';
import { AccessJwtPayload } from '../../../user-accounts/dto/access-jwt-payload';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';

@Injectable()
export class JwtAccessStrategyWrap extends PassportStrategy(
  Strategy,
  'jwt-access-wrap',
) {
  constructor(
    private authService: AuthServiceWrap,
    coreConfig: CoreConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: coreConfig.accessJwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AccessJwtPayload): Promise<UserContextDto> {
    const user = await this.authService.validateUserFromAccessToken(payload);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
