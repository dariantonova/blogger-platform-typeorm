import { UserDtoSql } from '../../dto/user.dto.sql';

export class UserRow {
  id: number;
  login: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export const mapUserRowToDto = (row: UserRow): UserDtoSql => {
  return {
    id: row.id,
    login: row.login,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
