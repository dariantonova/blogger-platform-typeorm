import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';
import { Trim } from '../../../../core/decorators/transform/trim';
import { IsStringOfLengthWithTrim } from '../../../../core/decorators/validation/is-string-of-length-with-trim';

export class CreateUserInputDto {
  @IsStringOfLengthWithTrim(
    loginConstraints.minLength,
    loginConstraints.maxLength,
  )
  @IsNotEmpty()
  login: string;

  @Matches(emailConstraints.match)
  @IsEmail()
  @Trim()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsStringOfLengthWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  @IsNotEmpty()
  password: string;
}
