import { UserConfirmationWrap } from './user-confirmation.wrap';
import { PasswordRecoveryWrap } from './password-recovery.wrap';
import { CreateUserDomainDto } from '../../user-accounts/domain/dto/create-user.domain.dto';
import { RemoveMethods } from '../../../common/types/remove-methods.type';
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

  dtoToUpdate: Partial<RemoveMethods<UserWrap>>;

  static createInstance(
    dto: CreateUserDomainDto,
    isConfirmed: boolean,
  ): UserWrap {
    const user = new UserWrap();

    user.dtoToUpdate = {};

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

    user.dtoToUpdate = {};

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

    this.dtoToUpdate.deletedAt = this.deletedAt;
  }

  setConfirmationCode(code: string, codeLifetimeInSeconds: number) {
    this.confirmationInfo.setConfirmationCode(code, codeLifetimeInSeconds);
  }

  makeConfirmed() {
    this.confirmationInfo.makeConfirmed();
  }

  setPasswordRecoveryCodeHash(codeHash: string, codeLifetimeInSeconds: number) {
    if (!this.passwordRecoveryInfo) {
      this.passwordRecoveryInfo = PasswordRecoveryWrap.createInstance({
        recoveryCodeHash: codeHash,
        recoveryCodeLifetimeInSeconds: codeLifetimeInSeconds,
      });
    } else {
      this.passwordRecoveryInfo.setRecoveryCodeHash(
        codeHash,
        codeLifetimeInSeconds,
      );
    }
  }

  resetPasswordRecoveryInfo() {
    this.passwordRecoveryInfo?.makeExpired();
  }

  setPasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;

    this.dtoToUpdate.passwordHash = this.passwordHash;
  }

  completeUpdate() {
    this.dtoToUpdate = {};
  }
}
