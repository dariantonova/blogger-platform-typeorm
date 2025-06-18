import { CreatePasswordRecoveryDomainDto } from './dto/create-password-recovery.domain-dto';
import { add } from 'date-fns';
import { PasswordRecoveryRow } from '../infrastructure/dto/password-recovery.row';

export class PasswordRecovery {
  recoveryCodeHash: string;
  expirationDate: Date;

  static createInstance(
    dto: CreatePasswordRecoveryDomainDto,
  ): PasswordRecovery {
    const passwordRecovery = new PasswordRecovery();

    passwordRecovery.setRecoveryCodeHash(
      dto.recoveryCodeHash,
      dto.recoveryCodeLifetimeInSeconds,
    );

    return passwordRecovery;
  }

  static reconstitute(row: PasswordRecoveryRow): PasswordRecovery {
    const passwordRecovery = new PasswordRecovery();

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
