import { CreatePasswordRecoveryDomainDto } from './dto/create-password-recovery.domain-dto';
import { add } from 'date-fns';
import { RemoveMethods } from '../../../common/types/remove-methods.type';
import { PasswordRecoveryRowWrap } from '../infrastructure/dto/password-recovery.row.wrap';

export class PasswordRecoveryWrap {
  recoveryCodeHash: string;
  expirationDate: Date;

  isNew: boolean;
  dtoToUpdate: Partial<RemoveMethods<PasswordRecoveryWrap>>;

  static createInstance(
    dto: CreatePasswordRecoveryDomainDto,
  ): PasswordRecoveryWrap {
    const passwordRecovery = new PasswordRecoveryWrap();

    passwordRecovery.isNew = true;
    passwordRecovery.dtoToUpdate = {};

    passwordRecovery.setRecoveryCodeHash(
      dto.recoveryCodeHash,
      dto.recoveryCodeLifetimeInSeconds,
    );

    return passwordRecovery;
  }

  static reconstitute(row: PasswordRecoveryRowWrap): PasswordRecoveryWrap {
    const passwordRecovery = new PasswordRecoveryWrap();

    passwordRecovery.isNew = false;
    passwordRecovery.dtoToUpdate = {};

    passwordRecovery.recoveryCodeHash = row.password_recovery_code_hash;
    passwordRecovery.expirationDate = row.password_recovery_expiration_date;

    return passwordRecovery;
  }

  setRecoveryCodeHash(codeHash: string, codeLifetimeInSeconds: number) {
    this.recoveryCodeHash = codeHash;
    this.expirationDate = add(new Date(), {
      seconds: codeLifetimeInSeconds,
    });

    if (!this.isNew) {
      this.dtoToUpdate.recoveryCodeHash = this.recoveryCodeHash;
      this.dtoToUpdate.expirationDate = this.expirationDate;
    }
  }

  makeExpired() {
    this.expirationDate = new Date();

    if (!this.isNew) {
      this.dtoToUpdate.expirationDate = this.expirationDate;
    }
  }

  removeNewFlag() {
    this.isNew = false;
  }

  completeUpdate() {
    this.dtoToUpdate = {};
  }
}
