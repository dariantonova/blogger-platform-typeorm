export class CreateUserConfirmationDomainDto {
  confirmationCode: string | null;
  expirationDate: Date | null;
  isConfirmed: boolean;
}
