import { User } from '../user.entity';

export class CreateUserConfirmationDomainDto {
  confirmationCode: string | null;
  expirationDate: Date | null;
  isConfirmed: boolean;
  user: User;
}
