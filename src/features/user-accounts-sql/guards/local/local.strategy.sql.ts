import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { FieldError } from '../../../../core/exceptions/field-error';
import { AuthServiceSql } from '../../application/auth.service.sql';
import { UserContextDtoSql } from '../dto/user-context.dto.sql';

@Injectable()
export class LocalStrategySql extends PassportStrategy(Strategy, 'local-sql') {
  constructor(private authService: AuthServiceSql) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(
    username: string,
    password: string,
  ): Promise<UserContextDtoSql> {
    validateInput(username, password);

    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}

function validateInput(username: any, password: any) {
  const errors: FieldError[] = [];

  if (typeof username !== 'string') {
    errors.push({
      field: 'loginOrEmail',
      message: 'Login or email must be a string',
    });
  } else {
    if (username.trim().length === 0) {
      errors.push({
        field: 'loginOrEmail',
        message: 'Login or email should not be empty',
      });
    }
  }

  if (typeof password !== 'string') {
    errors.push({
      field: 'password',
      message: 'Password must be a string',
    });
  } else {
    if (password.trim().length === 0) {
      errors.push({
        field: 'password',
        message: 'Password should not be empty',
      });
    }
  }

  if (errors.length !== 0) {
    throw new BadRequestException({ errors });
  }
}
