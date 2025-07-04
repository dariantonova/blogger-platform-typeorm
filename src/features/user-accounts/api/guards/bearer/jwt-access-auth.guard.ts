import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard('jwt-access') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException({ info });
    }
    return user;
  }
}
