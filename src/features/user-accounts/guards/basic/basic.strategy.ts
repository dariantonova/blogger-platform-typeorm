import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  async validate(username: string, password: string): Promise<boolean> {
    if (
      username === process.env.HTTP_BASIC_USER &&
      password === process.env.HTTP_BASIC_PASS
    ) {
      return true;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
