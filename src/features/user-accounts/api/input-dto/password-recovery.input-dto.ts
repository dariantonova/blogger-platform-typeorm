import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { emailConstraints } from '../../domain/user.entity';
import { Trim } from '../../../../core/decorators/transform/trim';

export class PasswordRecoveryInputDto {
  @Matches(emailConstraints.match)
  @IsEmail()
  @Trim()
  @IsString()
  @IsNotEmpty()
  email: string;
}
