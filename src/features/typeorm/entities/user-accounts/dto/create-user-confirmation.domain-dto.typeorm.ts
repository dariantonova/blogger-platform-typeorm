import { User } from '../user.entity';

export class CreateUserConfirmationDomainDtoTypeorm {
  confirmationCode: string | null;
  expirationDate: Date | null;
  isConfirmed: boolean;
  user: User;
}
