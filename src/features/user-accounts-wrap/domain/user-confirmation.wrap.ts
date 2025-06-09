import { CreateUserConfirmationDomainDto } from './dto/create-user-confirmation.domain-dto';
import { add } from 'date-fns';
import { RemoveMethods } from '../../../common/types/remove-methods.type';

export class UserConfirmationWrap {
  confirmationCode: string | null;
  expirationDate: Date | null;
  isConfirmed: boolean;

  dtoToUpdate: Partial<RemoveMethods<UserConfirmationWrap>>;

  static createInstance(
    dto: CreateUserConfirmationDomainDto,
  ): UserConfirmationWrap {
    const userConfirmation = new UserConfirmationWrap();

    userConfirmation.confirmationCode = dto.confirmationCode;
    userConfirmation.expirationDate = dto.expirationDate;
    userConfirmation.isConfirmed = dto.isConfirmed;

    return userConfirmation;
  }

  setConfirmationCode(code: string, codeLifetimeInSeconds: number) {
    this.confirmationCode = code;
    this.expirationDate = add(new Date(), {
      seconds: codeLifetimeInSeconds,
    });

    this.dtoToUpdate.confirmationCode = this.confirmationCode;
    this.dtoToUpdate.expirationDate = this.expirationDate;
  }

  makeConfirmed() {
    this.isConfirmed = true;

    this.dtoToUpdate.isConfirmed = this.isConfirmed;
  }

  completeUpdate() {
    this.dtoToUpdate = {};
  }
}
