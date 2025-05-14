import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserRepoDto } from './dto/create-user.repo-dto';
import { UserDtoSql } from '../dto/user.dto.sql';
import { mapUserRowToDto } from './mappers/user.mapper';

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
    `;
    const findResult = await this.dataSource.query(findQuery, [email]);

    return findResult[0] ? mapUserRowToDto(findResult[0]) : null;
  }
}
