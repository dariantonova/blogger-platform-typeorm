export class PasswordRecoveryInfoStrictDto {
  recoveryCodeHash: string;
  expirationDate: Date;
}

export class UserWithPasswordRecoveryStrictDtoSql {
  id: number;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  passwordRecoveryInfo: PasswordRecoveryInfoStrictDto;
}
