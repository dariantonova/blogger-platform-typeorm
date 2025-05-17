export class UserWithConfirmationDtoSql {
  id: number;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  confirmationInfo: {
    confirmationCode: string | null;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };
}
