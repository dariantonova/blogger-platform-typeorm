import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserAccountsConfig } from '../../../user-accounts.config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private userAccountsConfig: UserAccountsConfig) {
    super();
  }

  async validate(username: string, password: string): Promise<boolean> {
    if (
      username === this.userAccountsConfig.httpBasicUser &&
      password === this.userAccountsConfig.httpBasicPass
    ) {
      return true;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
