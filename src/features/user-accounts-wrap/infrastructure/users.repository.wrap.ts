import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
      }

      if (isUpdateNeeded(user.confirmationInfo)) {
        await this.updateUserConfirmation(+user.id, user.confirmationInfo);
      }

      if (
        user.passwordRecoveryInfo &&
        isUpdateNeeded(user.passwordRecoveryInfo)
      ) {
        await this.updatePasswordRecovery(+user.id, user.passwordRecoveryInfo);
      }
    }

    if (user.passwordRecoveryInfo && user.passwordRecoveryInfo.isNew) {
      await this.createPasswordRecovery(+user.id, user.passwordRecoveryInfo);
    }

    return user;
  }

  async findById(id: string): Promise<UserWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND u.id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [+id]);

    return findResult[0] ? UserWrap.reconstitute(findResult[0]) : null;
  }

  async findByIdOrNotFoundFail(id: string): Promise<UserWrap> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIdOrInternalFail(id: string): Promise<UserWrap> {
    const user = await this.findById(id);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return user;
  }

  async findByLogin(login: string): Promise<UserWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND u.login = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [login]);

    return findResult[0] ? UserWrap.reconstitute(findResult[0]) : null;
  }

  async findByEmail(email: string): Promise<UserWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND u.email = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [email]);

    return findResult[0] ? UserWrap.reconstitute(findResult[0]) : null;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND (u.login = $1 OR u.email = $1);
    `;
    const findResult = await this.dataSource.query(findQuery, [loginOrEmail]);

    return findResult[0] ? UserWrap.reconstitute(findResult[0]) : null;
  }

  async findByConfirmationCode(
    confirmationCode: string,
  ): Promise<UserWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND uc.confirmation_code = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [
      confirmationCode,
    ]);

    return findResult[0] ? UserWrap.reconstitute(findResult[0]) : null;
  }

  async findByPasswordRecoveryCodeHash(
    recoveryCodeHash: string,
  ): Promise<UserWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND pr.recovery_code_hash = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [
      recoveryCodeHash,
    ]);

    return findResult[0] ? UserWrap.reconstitute(findResult[0]) : null;
  }

  private buildSelectFromClause(): string {
    return `
    SELECT
    u.id, u.login, u.email, u.password_hash, u.created_at, u.updated_at, u.deleted_at,
    uc.confirmation_code, uc.expiration_date as confirmation_expiration_date, uc.is_confirmed,
    pr.recovery_code_hash as password_recovery_code_hash, 
    pr.expiration_date as password_recovery_expiration_date
    FROM users u
    LEFT JOIN user_confirmations uc ON u.id = uc.user_id
    LEFT JOIN password_recoveries pr ON u.id = pr.user_id
    `;
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
    WHERE id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, id]);

    user.completeUpdate();

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
    WHERE user_id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, userId]);

    confirmation.completeUpdate();

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

    passwordRecovery.removeNewFlag();

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
    WHERE user_id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, userId]);

    passwordRecovery.completeUpdate();

    return passwordRecovery;
  }
}
