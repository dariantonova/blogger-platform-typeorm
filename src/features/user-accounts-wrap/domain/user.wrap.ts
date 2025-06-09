import { UserConfirmationWrap } from './user-confirmation.wrap';
import { PasswordRecoveryWrap } from './password-recovery.wrap';
import { CreateUserDomainDto } from '../../user-accounts/domain/dto/create-user.domain.dto';
import { RemoveMethods } from '../../../common/types/remove-methods.type';

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
