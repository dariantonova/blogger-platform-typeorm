import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserRepoDto } from './dto/create-user.repo-dto';
import { UserDtoSql } from '../dto/user.dto.sql';
import { mapUserRowToDto } from './mappers/user.mapper';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserWithConfirmationDtoSql } from '../dto/user-with-confirmation.dto.sql';
import { mapUserWithConfirmationRowToDto } from './mappers/user-with-confirmation.mapper';

export class UsersRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUserWithConfirmation(dto: CreateUserRepoDto): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const createUserQuery = `
      INSERT INTO users
      (login, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id
      `;
      const userResult = await manager.query(createUserQuery, [
        dto.login,
        dto.email,
        dto.passwordHash,
      ]);
      const createdUserId = Number(userResult[0].id);

      const createUserConfirmationQuery = `
      INSERT INTO user_confirmations
      (user_id, confirmation_code, expiration_date, is_confirmed)
      VALUES ($1, $2, $3, $4)
      `;
      await manager.query(createUserConfirmationQuery, [
        createdUserId,
        dto.confirmationInfo.confirmationCode,
        dto.confirmationInfo.expirationDate,
        dto.confirmationInfo.isConfirmed,
      ]);

      return createdUserId;
    });
  }

  async findByLogin(login: string): Promise<UserDtoSql | null> {
    const findQuery = `
    SELECT
    u.id, u.login, u.email, u.password_hash, u.created_at, u.updated_at
    FROM users u
    WHERE u.login = $1
    AND u.deleted_at IS NULL
    `;
    const findResult = await this.dataSource.query(findQuery, [login]);

    return findResult[0] ? mapUserRowToDto(findResult[0]) : null;
  }

  async findByEmail(email: string): Promise<UserDtoSql | null> {
    const findQuery = `
    SELECT
    u.id, u.login, u.email, u.password_hash, u.created_at, u.updated_at
    FROM users u
    WHERE u.email = $1
    AND u.deleted_at IS NULL
    `;
    const findResult = await this.dataSource.query(findQuery, [email]);

    return findResult[0] ? mapUserRowToDto(findResult[0]) : null;
  }

  async findUserWithConfirmationByEmail(
    email: string,
  ): Promise<UserWithConfirmationDtoSql | null> {
    const findQuery = `
    SELECT
    u.id, u.login, u.email, u.password_hash, u.created_at, u.updated_at,
    uc.confirmation_code, uc.expiration_date, uc.is_confirmed
    FROM users u
    LEFT JOIN user_confirmations uc
    ON u.id = uc.user_id
    WHERE u.email = $1
    AND u.deleted_at IS NULL
    `;
    const findResult = await this.dataSource.query(findQuery, [email]);

    return findResult[0]
      ? mapUserWithConfirmationRowToDto(findResult[0])
      : null;
  }

  async findById(id: number): Promise<UserDtoSql | null> {
    const findQuery = `
    SELECT
    u.id, u.login, u.email, u.password_hash, u.created_at, u.updated_at
    FROM users u
    WHERE u.id = $1
    AND u.deleted_at IS NULL
    `;
    const findResult = await this.dataSource.query(findQuery, [id]);

    return findResult[0] ? mapUserRowToDto(findResult[0]) : null;
  }

  async findByIdOrNotFoundFail(id: number): Promise<UserDtoSql> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIdOrInternalFail(id: number): Promise<UserDtoSql> {
    const user = await this.findById(id);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return user;
  }

  async softDeleteUserAggregateById(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const deleteUserQuery = `
      UPDATE users
      SET deleted_at = now()
      WHERE id = $1
      AND deleted_at IS NULL
      `;
      await manager.query(deleteUserQuery, [id]);

      const deletePasswordRecoveriesQuery = `
      DELETE FROM password_recoveries
      WHERE user_id = $1
      `;
      await manager.query(deletePasswordRecoveriesQuery, [id]);
    });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDtoSql | null> {
    const findQuery = `
    SELECT
    u.id, u.login, u.email, u.password_hash, u.created_at, u.updated_at
    FROM users u
    WHERE u.deleted_at IS NULL
    AND (u.login = $1 OR u.email = $1)
    `;
    const findResult = await this.dataSource.query(findQuery, [loginOrEmail]);

    return findResult[0] ? mapUserRowToDto(findResult[0]) : null;
  }

  async updateUserConfirmationCode(
    userId: number,
    confirmationCode: string,
    expirationDate: Date,
  ): Promise<void> {
    const updateQuery = `
    UPDATE user_confirmations
    SET confirmation_code = $1, expiration_date = $2
    WHERE user_id = $3
    `;
    await this.dataSource.query(updateQuery, [
      confirmationCode,
      expirationDate,
      userId,
    ]);
  }
}
