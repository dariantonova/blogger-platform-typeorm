import { IsStringOfLengthWithTrim } from '../../../../core/decorators/validation/is-string-of-length-with-trim';
import { passwordConstraints } from '../../domain/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class NewPasswordRecoveryInputDto {
  @IsStringOfLengthWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  recoveryCode: string;
}
