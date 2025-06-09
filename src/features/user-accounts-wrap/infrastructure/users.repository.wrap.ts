import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserWrap } from '../domain/user.wrap';
import { UserConfirmationWrap } from '../domain/user-confirmation.wrap';
import { isUpdateNeeded } from '../../wrap/utils/is-update-needed';
import { getNewValuesFromDtoToUpdate } from '../../wrap/utils/get-new-values-from-dto-to-update';
import { buildUpdateSetClause } from '../../wrap/utils/build-update-set-clause';
import { PasswordRecoveryWrap } from '../domain/password-recovery.wrap';

@Injectable()
export class UsersRepositoryWrap {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(user: UserWrap): Promise<UserWrap> {
    if (!user.id) {
      await this.createUser(user);
      await this.createUserConfirmation(+user.id, user.confirmationInfo);
    } else {
      if (isUpdateNeeded(user)) {
        await this.updateUser(user);
        user.completeUpdate();
      }

      if (isUpdateNeeded(user.confirmationInfo)) {
        await this.updateUserConfirmation(+user.id, user.confirmationInfo);
        user.confirmationInfo.completeUpdate();
      }

      if (user.passwordRecoveryInfo && user.passwordRecoveryInfo.isNew) {
        await this.createPasswordRecovery(+user.id, user.passwordRecoveryInfo);
        user.passwordRecoveryInfo.removeNewFlag();
      }

      if (
        user.passwordRecoveryInfo &&
        isUpdateNeeded(user.passwordRecoveryInfo)
      ) {
        await this.updatePasswordRecovery(+user.id, user.passwordRecoveryInfo);
        user.passwordRecoveryInfo.completeUpdate();
      }
    }

    return user;
  }

  private async createUser(user: UserWrap): Promise<UserWrap> {
    const createQuery = `
    INSERT INTO users
    (login, email, password_hash, created_at, updated_at, deleted_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
    `;
    const createResult = await this.dataSource.query(createQuery, [
      user.login,
      user.email,
      user.passwordHash,
      user.createdAt,
      user.updatedAt,
      user.deletedAt,
    ]);

    user.id = createResult[0].id.toString();

    return user;
  }

  private async createUserConfirmation(
    userId: number,
    confirmation: UserConfirmationWrap,
  ): Promise<UserConfirmationWrap> {
    const createQuery = `
    INSERT INTO user_confirmations
    (user_id, confirmation_code, expiration_date, is_confirmed)
    VALUES ($1, $2, $3, $4);
    `;
    await this.dataSource.query(createQuery, [
      userId,
      confirmation.confirmationCode,
      confirmation.expirationDate,
      confirmation.isConfirmed,
    ]);

    return confirmation;
  }

  private async updateUser(user: UserWrap): Promise<UserWrap> {
    const { id, dtoToUpdate } = user;
    const newValues = getNewValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE users
    ${updateSetClause}
    WHERE id = ${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, id]);

    return user;
  }

  private async updateUserConfirmation(
    userId: number,
    confirmation: UserConfirmationWrap,
  ): Promise<UserConfirmationWrap> {
    const { dtoToUpdate } = confirmation;
    const newValues = getNewValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE user_confirmations
    ${updateSetClause}
    WHERE user_id = ${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, userId]);

    return confirmation;
  }

  private async createPasswordRecovery(
    userId: number,
    passwordRecovery: PasswordRecoveryWrap,
  ): Promise<PasswordRecoveryWrap> {
    const createQuery = `
    INSERT INTO password_recoveries
    (user_id, recovery_code_hash, expiration_date)
    VALUES ($1, $2, $3)
    `;
    await this.dataSource.query(createQuery, [
      userId,
      passwordRecovery.recoveryCodeHash,
      passwordRecovery.expirationDate,
    ]);

    return passwordRecovery;
  }

  private async updatePasswordRecovery(
    userId: number,
    passwordRecovery: PasswordRecoveryWrap,
  ): Promise<PasswordRecoveryWrap> {
    const { dtoToUpdate } = passwordRecovery;
    const newValues = getNewValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE password_recoveries
    ${updateSetClause}
    WHERE user_id = ${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, userId]);

    return passwordRecovery;
  }
}
