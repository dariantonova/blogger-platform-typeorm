import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserContextDto } from '../dto/user-context.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'access-token-secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: UserContextDto): Promise<UserContextDto> {
    return payload;
  }
}
