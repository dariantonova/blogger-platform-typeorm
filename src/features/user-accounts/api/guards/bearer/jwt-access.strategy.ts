import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { CoreConfig } from '../../../../../core/core.config';
import { AuthService } from '../../../application/auth.service';
import { AccessJwtPayloadDto } from '../../../dto/access-jwt-payload.dto';
import { UserContextDto } from '../dto/user-context.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code';

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

  async validate(payload: AccessJwtPayloadDto): Promise<UserContextDto> {
    const user = await this.authService.validateUserFromAccessToken(payload);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'User not found',
      });
    }

    return user;
  }
}
