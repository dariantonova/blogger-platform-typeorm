import { UserWithConfirmationStrictDtoSql } from '../../dto/user-with-confirmation-strict-dto.sql';

export class UserWithConfirmationRowStrict {
  id: number;
  login: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  confirmation_code: string;
  expiration_date: Date;
  is_confirmed: boolean;
}

export const mapUserWithConfirmationRowToDtoStrict = (
  row: UserWithConfirmationRowStrict,
): UserWithConfirmationStrictDtoSql => {
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
