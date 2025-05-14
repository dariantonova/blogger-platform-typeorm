import { UserDtoSql } from '../../dto/user.dto.sql';

export class UserRow {
  id: string;
  login: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export const mapUserRowToDto = (row: UserRow): UserDtoSql => {
  return {
    id: +row.id,
    login: row.login,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};
