import { UserWithConfirmationDtoSql } from '../../dto/user-with-confirmation.dto.sql';

export class UserWithConfirmationRow {
  id: number;
  login: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  confirmation_code: string | null;
  expiration_date: Date | null;
  is_confirmed: boolean;
}

export const mapUserWithConfirmationRowToDto = (
  row: UserWithConfirmationRow,
): UserWithConfirmationDtoSql => {
  return {
    id: row.id,
    login: row.login,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    confirmationInfo: {
      confirmationCode: row.confirmation_code,
      expirationDate: row.expiration_date,
      isConfirmed: row.is_confirmed,
    },
  };
};
