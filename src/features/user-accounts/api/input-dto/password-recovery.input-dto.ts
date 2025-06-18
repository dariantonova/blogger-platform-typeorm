import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import { emailConstraints } from '../../domain/user-constraints';

export class PasswordRecoveryInputDto {
  @Matches(emailConstraints.match)
  @IsEmail()
  @Trim()
  @IsString()
  @IsNotEmpty()
  email: string;
}
