import { UserConfirmation } from './user-confirmation.entity';
import { PasswordRecovery } from './password-recovery.entity';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { UserRow } from '../infrastructure/dto/user.row';

export class User {
  id: number;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  confirmationInfo: UserConfirmation;
  passwordRecoveryInfo: PasswordRecovery | null;

  static createInstance(dto: CreateUserDomainDto, isConfirmed: boolean): User {
    const user = new User();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.deletedAt = null;
    user.confirmationInfo = UserConfirmation.createInstance({
      confirmationCode: null,
      expirationDate: null,
      isConfirmed,
    });
    user.passwordRecoveryInfo = null;

    return user;
  }

  static reconstitute(row: UserRow): User {
    const user = new User();

    user.id = row.id;
    user.login = row.login;
    user.email = row.email;
    user.passwordHash = row.password_hash;
    user.createdAt = row.created_at;
    user.updatedAt = row.updated_at;
    user.deletedAt = row.deleted_at;
    user.confirmationInfo = UserConfirmation.reconstitute({
      confirmation_code: row.confirmation_code,
      confirmation_expiration_date: row.confirmation_expiration_date,
      is_confirmed: row.is_confirmed,
    });
    if (
      row.password_recovery_code_hash &&
      row.password_recovery_expiration_date
    ) {
      user.passwordRecoveryInfo = PasswordRecovery.reconstitute({
        password_recovery_code_hash: row.password_recovery_code_hash,
        password_recovery_expiration_date:
          row.password_recovery_expiration_date,
      });
    } else {
      user.passwordRecoveryInfo = null;
    }

    return user;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('User is already deleted');
    }
    this.deletedAt = new Date();
  }

  setConfirmationCode(code: string, codeLifetimeInSeconds: number) {
    this.confirmationInfo.setConfirmationCode(code, codeLifetimeInSeconds);
    this.updatedAt = new Date();
  }

  makeConfirmed() {
    this.confirmationInfo.makeConfirmed();
    this.updatedAt = new Date();
  }

  setPasswordRecoveryCodeHash(
    recoveryCodeHash: string,
    recoveryCodeLifetimeInSeconds: number,
  ) {
    if (!this.passwordRecoveryInfo) {
      this.passwordRecoveryInfo = PasswordRecovery.createInstance({
        recoveryCodeHash,
        recoveryCodeLifetimeInSeconds,
      });
    } else {
      this.passwordRecoveryInfo.setRecoveryCodeHash(
        recoveryCodeHash,
        recoveryCodeLifetimeInSeconds,
      );
    }

    this.updatedAt = new Date();
  }

  resetPasswordRecoveryInfo() {
    this.passwordRecoveryInfo = null;
  }

  setPasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;
    this.updatedAt = new Date();
  }
}
