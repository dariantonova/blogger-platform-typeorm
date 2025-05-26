export class ConfirmationInfoStrictDto {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

export class UserWithConfirmationStrictDtoSql {
  id: number;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  confirmationInfo: ConfirmationInfoStrictDto;
}
