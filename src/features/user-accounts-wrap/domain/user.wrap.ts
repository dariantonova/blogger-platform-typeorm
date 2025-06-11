import { UserConfirmationWrap } from './user-confirmation.wrap';
import { PasswordRecoveryWrap } from './password-recovery.wrap';
import { CreateUserDomainDto } from '../../user-accounts/domain/dto/create-user.domain.dto';
import { UserRowWrap } from '../infrastructure/dto/user.row.wrap';

export class UserWrap {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  confirmationInfo: UserConfirmationWrap;
  passwordRecoveryInfo: PasswordRecoveryWrap | null;

  static createInstance(
    dto: CreateUserDomainDto,
    isConfirmed: boolean,
  ): UserWrap {
    const user = new UserWrap();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.deletedAt = null;
    user.confirmationInfo = UserConfirmationWrap.createInstance({
      confirmationCode: null,
      expirationDate: null,
      isConfirmed,
    });
    user.passwordRecoveryInfo = null;

    return user;
  }

  static reconstitute(row: UserRowWrap): UserWrap {
    const user = new UserWrap();

    user.id = row.id.toString();
    user.login = row.login;
    user.email = row.email;
    user.passwordHash = row.password_hash;
    user.createdAt = row.created_at;
    user.updatedAt = row.updated_at;
    user.deletedAt = row.deleted_at;
    user.confirmationInfo = UserConfirmationWrap.reconstitute({
      confirmation_code: row.confirmation_code,
      confirmation_expiration_date: row.confirmation_expiration_date,
      is_confirmed: row.is_confirmed,
    });
    if (
      row.password_recovery_code_hash &&
      row.password_recovery_expiration_date
    ) {
      user.passwordRecoveryInfo = PasswordRecoveryWrap.reconstitute({
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
  }

  makeConfirmed() {
    this.confirmationInfo.makeConfirmed();
  }

  setPasswordRecoveryCodeHash(
    recoveryCodeHash: string,
    recoveryCodeLifetimeInSeconds: number,
  ) {
    if (!this.passwordRecoveryInfo) {
      this.passwordRecoveryInfo = PasswordRecoveryWrap.createInstance({
        recoveryCodeHash,
        recoveryCodeLifetimeInSeconds,
      });
    } else {
      this.passwordRecoveryInfo.setRecoveryCodeHash(
        recoveryCodeHash,
        recoveryCodeLifetimeInSeconds,
      );
    }
  }

  resetPasswordRecoveryInfo() {
    this.passwordRecoveryInfo?.revoke();
  }

  setPasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;
  }
}
