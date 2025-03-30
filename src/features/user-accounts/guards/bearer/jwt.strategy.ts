import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserContextDto } from '../dto/user-context.dto';
import { UsersRepository } from '../../infrastructure/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'access-token-secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: UserContextDto): Promise<UserContextDto> {
    const user = await this.usersRepository.findById(payload.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { id: payload.id };
  }
}
