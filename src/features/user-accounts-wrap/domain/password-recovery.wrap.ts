import { CreatePasswordRecoveryDomainDto } from './dto/create-password-recovery.domain-dto';
import { add } from 'date-fns';
import { PasswordRecoveryRowWrap } from '../infrastructure/dto/password-recovery.row.wrap';

export class PasswordRecoveryWrap {
  recoveryCodeHash: string;
  expirationDate: Date;

  static createInstance(
    dto: CreatePasswordRecoveryDomainDto,
  ): PasswordRecoveryWrap {
    const passwordRecovery = new PasswordRecoveryWrap();

    passwordRecovery.setRecoveryCodeHash(
      dto.recoveryCodeHash,
      dto.recoveryCodeLifetimeInSeconds,
    );

    return passwordRecovery;
  }

  static reconstitute(row: PasswordRecoveryRowWrap): PasswordRecoveryWrap {
    const passwordRecovery = new PasswordRecoveryWrap();

    passwordRecovery.recoveryCodeHash = row.password_recovery_code_hash;
    passwordRecovery.expirationDate = row.password_recovery_expiration_date;

    return passwordRecovery;
  }

  setRecoveryCodeHash(codeHash: string, codeLifetimeInSeconds: number) {
    this.recoveryCodeHash = codeHash;
    this.expirationDate = add(new Date(), {
      seconds: codeLifetimeInSeconds,
    });
  }
}
