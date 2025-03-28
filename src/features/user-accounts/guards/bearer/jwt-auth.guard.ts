import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, host) {
    if (err || !user) {
      throw new UnauthorizedException({ info });
    }
    // todo: try to replace user with fake one
    return user;
  }
}
