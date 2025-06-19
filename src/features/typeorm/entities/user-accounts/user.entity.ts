import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserConfirmation } from './user-confirmation.entity';
import { PasswordRecovery } from './password-recovery.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @OneToOne(() => UserConfirmation, (uc) => uc.user)
  confirmationInfo: UserConfirmation;

  @OneToOne(() => PasswordRecovery, (pr) => pr.user)
  passwordRecoveryInfo: PasswordRecovery | null;

  // static createInstance(dto: CreateUserDomainDto, isConfirmed: boolean): User {
  //   const user = new User();
  //
  //   user.login = dto.login;
  //   user.email = dto.email;
  //   user.passwordHash = dto.passwordHash;
  //   user.createdAt = new Date();
  //   user.updatedAt = new Date();
  //   user.deletedAt = null;
  //   user.confirmationInfo = UserConfirmation.createInstance({
  //     confirmationCode: null,
  //     expirationDate: null,
  //     isConfirmed,
  //   });
  //   user.passwordRecoveryInfo = null;
  //
  //   return user;
  // }
  //
  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     throw new Error('User is already deleted');
  //   }
  //   this.deletedAt = new Date();
  // }
  //
  // setConfirmationCode(code: string, codeLifetimeInSeconds: number) {
  //   this.confirmationInfo.setConfirmationCode(code, codeLifetimeInSeconds);
  //   this.updatedAt = new Date();
  // }
  //
  // makeConfirmed() {
  //   this.confirmationInfo.makeConfirmed();
  //   this.updatedAt = new Date();
  // }
  //
  // setPasswordRecoveryCodeHash(
  //   recoveryCodeHash: string,
  //   recoveryCodeLifetimeInSeconds: number,
  // ) {
  //   if (!this.passwordRecoveryInfo) {
  //     this.passwordRecoveryInfo = PasswordRecovery.createInstance({
  //       recoveryCodeHash,
  //       recoveryCodeLifetimeInSeconds,
  //     });
  //   } else {
  //     this.passwordRecoveryInfo.setRecoveryCodeHash(
  //       recoveryCodeHash,
  //       recoveryCodeLifetimeInSeconds,
  //     );
  //   }
  //
  //   this.updatedAt = new Date();
  // }
  //
  // resetPasswordRecoveryInfo() {
  //   this.passwordRecoveryInfo = null;
  // }
  //
  // setPasswordHash(passwordHash: string) {
  //   this.passwordHash = passwordHash;
  //   this.updatedAt = new Date();
  // }
}
