import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../domain/user.entity';
import { UserConfirmation } from '../domain/user-confirmation.entity';
import { getValuesFromDtoToUpdate } from '../../../common/utils/sql/get-values-from-dto-to-update';
import { buildUpdateSetClause } from '../../../common/utils/sql/build-update-set-clause';
import { PasswordRecovery } from '../domain/password-recovery.entity';
import { RemoveMethods } from '../../../common/types/remove-methods.type';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(user: User): Promise<User> {
    if (!user.id) {
      await this.createUser(user);
      await this.createUserConfirmation(user.id, user.confirmationInfo);
    } else {
      const { id, confirmationInfo, passwordRecoveryInfo, ...dtoToUpdate } =
        user;

      await this.updateUser(id, dtoToUpdate);

      const { ...confirmationDtoToUpdate } = confirmationInfo;
      await this.updateUserConfirmation(id, confirmationDtoToUpdate);
    }

    if (user.passwordRecoveryInfo) {
      const { ...passwordRecoveryDto } = user.passwordRecoveryInfo;
      await this.createOrUpdatePasswordRecovery(user.id, passwordRecoveryDto);
    }

    return user;
  }

  async findById(id: number): Promise<User | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND u.id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [id]);

    return findResult[0] ? User.reconstitute(findResult[0]) : null;
  }

  async findByIdOrNotFoundFail(id: number): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIdOrInternalFail(id: number): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND u.login = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [login]);

    return findResult[0] ? User.reconstitute(findResult[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND u.email = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [email]);

    return findResult[0] ? User.reconstitute(findResult[0]) : null;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND (u.login = $1 OR u.email = $1);
    `;
    const findResult = await this.dataSource.query(findQuery, [loginOrEmail]);

    return findResult[0] ? User.reconstitute(findResult[0]) : null;
  }

  async findByConfirmationCode(confirmationCode: string): Promise<User | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND uc.confirmation_code = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [
      confirmationCode,
    ]);

    return findResult[0] ? User.reconstitute(findResult[0]) : null;
  }

  async findByPasswordRecoveryCodeHash(
    recoveryCodeHash: string,
  ): Promise<User | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND pr.recovery_code_hash = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [
      recoveryCodeHash,
    ]);

    return findResult[0] ? User.reconstitute(findResult[0]) : null;
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

  private async createUser(user: User): Promise<void> {
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

    user.id = createResult[0].id;
  }

  private async createUserConfirmation(
    userId: number,
    confirmation: UserConfirmation,
  ): Promise<void> {
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
  }

  private async updateUser(
    id: number,
    dtoToUpdate: Partial<User>,
  ): Promise<void> {
    const newValues = getValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE users
    ${updateSetClause}
    WHERE id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, id]);
  }

  private async updateUserConfirmation(
    userId: number,
    dtoToUpdate: Partial<UserConfirmation>,
  ): Promise<void> {
    const newValues = getValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE user_confirmations
    ${updateSetClause}
    WHERE user_id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, userId]);
  }

  private async createOrUpdatePasswordRecovery(
    userId: number,
    dto: RemoveMethods<PasswordRecovery>,
  ): Promise<void> {
    const createOrUpdateQuery = `
    INSERT INTO password_recoveries
    (user_id, recovery_code_hash, expiration_date)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id)
    DO UPDATE SET
    recovery_code_hash = EXCLUDED.recovery_code_hash,
    expiration_date = EXCLUDED.expiration_date;
    `;
    await this.dataSource.query(createOrUpdateQuery, [
      userId,
      dto.recoveryCodeHash,
      dto.expirationDate,
    ]);
  }

  async deletePasswordRecoveryByUserId(userId: number): Promise<void> {
    const deleteQuery = `
      DELETE FROM password_recoveries
      WHERE user_id = $1;
      `;
    await this.dataSource.query(deleteQuery, [userId]);
  }
}
