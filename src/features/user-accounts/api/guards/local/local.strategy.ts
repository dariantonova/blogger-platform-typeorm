import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FieldError } from '../../../../../core/exceptions/field-error';
import { AuthService } from '../../../application/auth.service';
import { UserContextDto } from '../dto/user-context.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(username: string, password: string): Promise<UserContextDto> {
    this.validateInput(username, password);

    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid credentials',
      });
    }
    return user;
  }

  private validateInput(username: any, password: any) {
    const errors: FieldError[] = [];

    if (typeof username !== 'string') {
      errors.push({
        field: 'loginOrEmail',
        message: 'Login or email is required',
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
        message: 'Password is required',
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
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid credentials',
        extensions: errors,
      });
    }
  }
}
