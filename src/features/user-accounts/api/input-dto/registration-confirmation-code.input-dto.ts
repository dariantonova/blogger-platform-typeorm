import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrationConfirmationCodeInputDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
