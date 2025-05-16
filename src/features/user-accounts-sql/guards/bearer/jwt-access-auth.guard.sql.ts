import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessAuthGuardSql extends AuthGuard('jwt-access-sql') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException({ info });
    }
    return user;
  }
}
