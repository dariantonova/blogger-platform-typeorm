import { IsStringOfLengthWithTrim } from '../../../../core/decorators/validation/is-string-of-length-with-trim';
import { IsNotEmpty, IsString } from 'class-validator';
import { passwordConstraints } from '../../domain/user-constraints';

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
