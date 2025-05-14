export class CreateUserRepoDto {
  login: string;
  email: string;
  passwordHash: string;
  confirmationInfo: {
    confirmationCode: string | null;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };
}
