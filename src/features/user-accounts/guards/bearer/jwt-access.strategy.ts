import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserContextDto } from '../dto/user-context.dto';
import { CoreConfig } from '../../../../core/core.config';
import { AccessJwtPayload } from '../../dto/access-jwt-payload';
import { AuthService } from '../../application/auth.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private authService: AuthService,
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
