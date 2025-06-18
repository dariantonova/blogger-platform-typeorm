import { CreateUserConfirmationDomainDto } from './dto/create-user-confirmation.domain-dto';
import { add } from 'date-fns';
import { UserConfirmationRow } from '../infrastructure/dto/user-confirmation.row';

export class UserConfirmation {
  confirmationCode: string | null;
  expirationDate: Date | null;
  isConfirmed: boolean;

  static createInstance(
    dto: CreateUserConfirmationDomainDto,
  ): UserConfirmation {
    const userConfirmation = new UserConfirmation();

    userConfirmation.confirmationCode = dto.confirmationCode;
    userConfirmation.expirationDate = dto.expirationDate;
    userConfirmation.isConfirmed = dto.isConfirmed;

    return userConfirmation;
  }

  static reconstitute(row: UserConfirmationRow): UserConfirmation {
    const userConfirmation = new UserConfirmation();

    userConfirmation.confirmationCode = row.confirmation_code;
    userConfirmation.expirationDate = row.confirmation_expiration_date;
    userConfirmation.isConfirmed = row.is_confirmed;

    return userConfirmation;
  }

  setConfirmationCode(code: string, codeLifetimeInSeconds: number) {
    this.confirmationCode = code;
    this.expirationDate = add(new Date(), {
      seconds: codeLifetimeInSeconds,
    });
  }

  makeConfirmed() {
    this.isConfirmed = true;
  }
}
